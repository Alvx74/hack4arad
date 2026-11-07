#!/usr/bin/env python3
"""Serve Arad Explorer over HTTPS for local testing.

Phones only give GPS to pages on HTTPS (or localhost), so this serves the
project folder over HTTPS on your network:

    python3 serve.py                # https://localhost:8443 and https://<your-ip>:8443
    python3 serve.py --port 9443
    python3 serve.py --new-cert     # after your computer's IP changed
    python3 serve.py --verbose      # log every request

Typing just "localhost:8443" (without https://) also works: plain HTTP on
the same port is redirected to HTTPS.

The first run creates a self-signed certificate in .certs/ (needs the
`openssl` command). Browsers warn about it once: choose "Advanced" ->
"Proceed" (Chrome) or "Accept the risk" (Firefox). Stop with Ctrl+C.
"""
import argparse
import errno
import http.server
import os
import re
import shutil
import socket
import ssl
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
CERT_DIR = os.path.join(ROOT, '.certs')
CERT = os.path.join(CERT_DIR, 'cert.pem')
KEY = os.path.join(CERT_DIR, 'key.pem')

# Errors that happen in normal use (browser closed a tab, cancelled a download,
# hasn't accepted the certificate yet...). They get one short line, no traceback.
QUIET = (ConnectionResetError, BrokenPipeError, ConnectionAbortedError, TimeoutError, socket.timeout, ssl.SSLError)


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
        sys.exit('Error: the "openssl" command was not found.\n'
                 'Install it (Ubuntu/Debian: sudo apt install openssl) and run again.')
    os.makedirs(CERT_DIR, exist_ok=True)
    san = 'subjectAltName=DNS:localhost,IP:127.0.0.1' + (f',IP:{ip}' if ip != '127.0.0.1' else '')
    try:
        subprocess.run([
            'openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '825',
            '-keyout', KEY, '-out', CERT, '-subj', '/CN=Arad Explorer (local)', '-addext', san,
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        sys.exit('Error: openssl could not create the certificate:\n' + e.stderr.decode(errors='replace').strip())
    print(f'Created a local certificate in {CERT_DIR}')


class Handler(http.server.SimpleHTTPRequestHandler):
    timeout = 60          # idle keep-alive connections are closed after this many seconds
    verbose = False

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')   # always fresh files while developing
        super().end_headers()

    def log_message(self, fmt, *args):
        if self.verbose:
            super().log_message(fmt, *args)

    def log_request(self, code='-', size='-'):
        # quiet by default; still show missing files and server errors
        if self.verbose or (isinstance(code, int) and code >= 400) or str(code)[:1] in ('4', '5'):
            http.server.BaseHTTPRequestHandler.log_message(self, '"%s" %s', self.requestline, str(code))

    def log_error(self, fmt, *args):
        if self.verbose:
            super().log_message(fmt, *args)


class DualServer(http.server.ThreadingHTTPServer):
    """HTTPS server that also answers plain HTTP on the same port with a redirect."""
    daemon_threads = True
    allow_reuse_address = True

    def __init__(self, addr, handler, ctx, port):
        super().__init__(addr, handler)
        self.ctx, self.port = ctx, port
        self._last_cert_hint = 0.0

    def finish_request(self, sock, client_address):
        sock.settimeout(15)
        try:
            first = sock.recv(1, socket.MSG_PEEK)
        except OSError:
            return
        if not first:
            return                                   # browser opened and closed a connection
        if first[0] != 0x16:                         # not a TLS handshake -> plain HTTP
            self.redirect_to_https(sock)
            return
        try:
            tls = self.ctx.wrap_socket(sock, server_side=True)
        except ssl.SSLError as e:
            self.cert_hint(e)
            return
        except OSError:
            return
        try:
            tls.settimeout(Handler.timeout)
            self.RequestHandlerClass(tls, client_address, self)
        finally:
            self.shutdown_request(tls)

    def redirect_to_https(self, sock):
        try:
            data = b''
            while b'\r\n\r\n' not in data and len(data) < 8192:
                chunk = sock.recv(1024)
                if not chunk:
                    break
                data += chunk
            lines = data.decode('latin-1').split('\r\n')
            parts = lines[0].split(' ') if lines else []
            path = parts[1] if len(parts) >= 2 and parts[1].startswith('/') else '/'
            host = next((l.split(':', 1)[1].strip() for l in lines[1:] if l.lower().startswith('host:')), f'localhost:{self.port}')
            if not re.fullmatch(r'[A-Za-z0-9.\-:\[\]]+', host):
                host = f'localhost:{self.port}'
            if not re.fullmatch(r"[A-Za-z0-9._~!$&'()*+,;=:@%/?#\-]*", path):
                path = '/'
            location = f'https://{host}{path}'
            body = f'Arad Explorer runs on HTTPS: {location}\n'.encode()
            sock.sendall(
                b'HTTP/1.1 301 Moved Permanently\r\n'
                + f'Location: {location}\r\n'.encode()
                + b'Content-Type: text/plain; charset=utf-8\r\n'
                + f'Content-Length: {len(body)}\r\n'.encode()
                + b'Connection: close\r\n\r\n' + body)
        except OSError:
            pass

    def cert_hint(self, err):
        # Browsers drop the first connection until you accept the self-signed certificate.
        reason = getattr(err, 'reason', '') or ''
        now = time.time()
        if now - self._last_cert_hint > 30:
            self._last_cert_hint = now
            if 'CERTIFICATE' in reason.upper() or 'UNKNOWN_CA' in reason.upper():
                print('  (The browser has not accepted the local certificate yet: on the warning page choose '
                      '"Advanced" -> "Proceed" / "Accept the risk". This message is normal.)')
            elif Handler.verbose:
                print(f'  (TLS handshake failed: {reason or err})')

    def handle_error(self, request, client_address):
        exc = sys.exc_info()[1]
        if isinstance(exc, QUIET):
            if Handler.verbose:
                print(f'  ({type(exc).__name__} from {client_address[0]})')
            return
        super().handle_error(request, client_address)


def main():
    ap = argparse.ArgumentParser(description='Serve Arad Explorer over HTTPS.')
    ap.add_argument('--port', type=int, default=8443)
    ap.add_argument('--host', default='0.0.0.0', help='0.0.0.0 = reachable from phones on the same Wi-Fi')
    ap.add_argument('--new-cert', action='store_true', help='create a new certificate (e.g. after the IP changed)')
    ap.add_argument('--verbose', action='store_true', help='log every request')
    args = ap.parse_args()
    Handler.verbose = args.verbose

    ip = lan_ip()
    if args.new_cert or not (os.path.exists(CERT) and os.path.exists(KEY)):
        make_cert(ip)

    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    try:
        ctx.load_cert_chain(CERT, KEY)
    except (ssl.SSLError, OSError) as e:
        sys.exit(f'Error: could not load the certificate ({e}).\nRun: python3 serve.py --new-cert')

    try:
        httpd = DualServer((args.host, args.port), Handler, ctx, args.port)
    except OSError as e:
        if e.errno in (errno.EADDRINUSE, getattr(errno, 'WSAEADDRINUSE', -1)):
            sys.exit(f'Error: port {args.port} is already in use (is serve.py already running in another terminal?).\n'
                     f'Stop the other one, or use another port: python3 serve.py --port 9443')
        raise

    print('Arad Explorer is running over HTTPS:')
    print(f'  on this computer:  https://localhost:{args.port}')
    if args.host == '0.0.0.0' and ip != '127.0.0.1':
        print(f'  on your phone:     https://{ip}:{args.port}   (same Wi-Fi)')
    print('The first time, the browser warns about the certificate: choose "Advanced" -> "Proceed".')
    print('Stop with Ctrl+C.')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
    finally:
        httpd.server_close()


if __name__ == '__main__':
    main()
