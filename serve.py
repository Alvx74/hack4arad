#!/usr/bin/env python3
"""Serve Arad Explorer over HTTPS for local testing.

Phones only give GPS to pages on HTTPS (or localhost), so this serves the
project folder over HTTPS on your network:

    python3 serve.py                # https://localhost:8443 and https://<your-ip>:8443
    python3 serve.py --port 9443

The first run creates a self-signed certificate in .certs/ (needs the
`openssl` command). Browsers warn about it once: choose "Advanced" ->
"Proceed" (Chrome) or "Accept the risk" (Firefox). Stop with Ctrl+C.
"""
import argparse
import http.server
import os
import shutil
import socket
import ssl
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
CERT_DIR = os.path.join(ROOT, '.certs')
CERT = os.path.join(CERT_DIR, 'cert.pem')
KEY = os.path.join(CERT_DIR, 'key.pem')


def lan_ip():
    """Best guess of this computer's address on the local network."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))  # no packet is sent
        return s.getsockname()[0]
    except OSError:
        return '127.0.0.1'
    finally:
        s.close()


def make_cert(ip):
    if not shutil.which('openssl'):
        sys.exit('openssl was not found. Install it (e.g. "sudo apt install openssl") and run again.')
    os.makedirs(CERT_DIR, exist_ok=True)
    san = 'subjectAltName=DNS:localhost,IP:127.0.0.1' + (f',IP:{ip}' if ip != '127.0.0.1' else '')
    subprocess.run([
        'openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '825',
        '-keyout', KEY, '-out', CERT, '-subj', '/CN=Arad Explorer (local)', '-addext', san,
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f'Created a local certificate in {CERT_DIR}')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # Always fetch fresh files while developing.
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


def main():
    ap = argparse.ArgumentParser(description='Serve Arad Explorer over HTTPS.')
    ap.add_argument('--port', type=int, default=8443)
    ap.add_argument('--host', default='0.0.0.0', help='0.0.0.0 = reachable from phones on the same Wi-Fi')
    ap.add_argument('--new-cert', action='store_true', help='create a new certificate (e.g. after the IP changed)')
    args = ap.parse_args()

    ip = lan_ip()
    if args.new_cert or not (os.path.exists(CERT) and os.path.exists(KEY)):
        make_cert(ip)

    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    ctx.load_cert_chain(CERT, KEY)

    httpd = http.server.ThreadingHTTPServer((args.host, args.port), Handler)
    # Handshake lazily in each connection's thread, so one client that rejects
    # the certificate can't stall the server.
    httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True, do_handshake_on_connect=False)

    print('Arad Explorer is running over HTTPS:')
    print(f'  on this computer:  https://localhost:{args.port}')
    if args.host == '0.0.0.0' and ip != '127.0.0.1':
        print(f'  on your phone:     https://{ip}:{args.port}   (same Wi-Fi)')
    print('Stop with Ctrl+C.')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')


if __name__ == '__main__':
    main()
