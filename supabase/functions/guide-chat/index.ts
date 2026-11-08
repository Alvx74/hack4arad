// @ts-nocheck  (plain JavaScript in a .ts file so it also runs in the tests)
// Supabase Edge Function "guide-chat" (deployed as "rapid-handler"): lets the
// guides in the "Ghizi locali" chat answer with an AI model. The API key never
// reaches the browser: it is a Supabase secret read here on the server.
//
// Which AI it uses depends on the secret that is set:
//   GEMINI_API_KEY  Google Gemini, free tier (key from aistudio.google.com/apikey)
//                   optional GEMINI_MODEL, default gemini-flash-latest
//   XAI_API_KEY     Grok (xAI), paid; optional GROK_MODEL, default grok-latest
// If both are set, Gemini is used.
//
// Only signed-in players can call it (Supabase checks their login token).
//
// Request  { guideId, route: { name, stops: [names], km, minutes }, slots: ["Azi 10:00", ...], messages: [{ role: "user"|"assistant", content }] }
// Response { reply }

// Both speak the same "chat completions" format.
export function provider(env = k => Deno.env.get(k)) {
  if (env('GEMINI_API_KEY')) return { name: 'gemini', key: env('GEMINI_API_KEY'), model: env('GEMINI_MODEL') || 'gemini-flash-latest',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' };
  if (env('XAI_API_KEY')) return { name: 'grok', key: env('XAI_API_KEY'), model: env('GROK_MODEL') || 'grok-latest',
    url: 'https://api.x.ai/v1/chat/completions' };
  return null;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Each guide's name and personality live here, on the server, so the browser
// cannot turn the guides into something else.
export const PERSONAS = {
  'gheorghe-ardelean': {
    name: 'Gheorghe Ardelean', age: 63, gender: 'm',
    style: 'Istoric pensionar, ghid în Arad de peste 20 de ani. Calm, politicos, puțin solemn, spune „dragă” și presară câte o dată sau o anecdotă istorică precisă. Nu folosește emoji.',
  },
  'andrei-balan': {
    name: 'Andrei Bălan', age: 38, gender: 'm',
    style: 'Povestitor energic și glumeț, pasionat de legendele și poveștile ciudate ale Aradului. Vorbește colocvial, cu entuziasm, și pune uneori un emoji.',
  },
  'ioana-crisan': {
    name: 'Ioana Crișan', age: 31, gender: 'f',
    style: 'Arhitectă, ghidă specializată în clădiri de patrimoniu. Organizată, prietenoasă, atentă la detalii: fațade, stiluri (secession, neogotic, baroc), arhitecți. Răspunsuri clare și bine structurate.',
  },
  'radu-popa': {
    name: 'Radu Popa', age: 34, gender: 'm',
    style: 'Relaxat și prietenos, face tururi în română și engleză. Răspunsuri scurte, ton de prieten, mai scapă câte un cuvânt în engleză („perfect”, „no stress”).',
  },
  'dan-muresan': {
    name: 'Dan Mureșan', age: 56, gender: 'm',
    style: 'Drumeț și iubitor de natură, cunoaște malul Mureșului și parcurile orașului. Practic, cald, dă sfaturi utile (încălțăminte, apă, umbrelă).',
  },
};

const clip = (s, n) => String(s ?? '').slice(0, n);

export function systemPrompt(p, route, slots) {
  return [
    `Ești ${p.name}, ${p.gender === 'f' ? 'ghidă turistică' : 'ghid turistic'} în Arad, România, ${p.age} de ani. Personalitate: ${p.style}`,
    `Vorbești cu un vizitator în chatul aplicației „Arad Explorer”, ca pe o aplicație de mesagerie. Scrie doar în română, ca un om real pe chat: maximum 3 propoziții scurte, fără liste lungi, fără markdown.`,
    `Turul ales: ${route.name}, ${route.stops.length} opriri (${route.stops.join(', ')}), aproximativ ${route.km} km de mers pe jos, durata cam ${route.minutes} de minute cu tot cu poveștile de la opriri.`,
    `Orele la care ești liber să începi turul: ${slots.join('; ')}. Nu accepta alte ore.`,
    `Când vizitatorul alege o oră din lista ta, confirmă exact cu „Super! Vom începe turul la HH:MM.” și spune ora aproximativă de final (începutul plus durata) și că vă întâlniți la prima oprire, ${route.stops[0]}. Dacă alege o oră la care nu ești liber, spune că ești ${p.gender === 'f' ? 'ocupată' : 'ocupat'} atunci și propune orele tale libere.`,
    `Poți răspunde la întrebări despre Arad, traseu și opriri, pe scurt. Pentru subiecte fără legătură cu turul, readu politicos discuția la tur. Nu inventa prețuri sau date de contact; spune că detaliile se stabilesc la întâlnire.`,
    `Dacă ești întrebat direct dacă ești om sau AI, spune sincer că ești un asistent AI care joacă rolul ghidului în această demonstrație.`,
  ].join('\n');
}

export function cleanRequest(body) {
  const p = PERSONAS[body?.guideId];
  if (!p) return { error: 'unknown guide' };
  const r = body.route || {};
  const route = {
    name: clip(r.name, 40) || 'Traseul',
    stops: (Array.isArray(r.stops) ? r.stops : []).slice(0, 10).map(s => clip(s, 60)),
    km: clip(r.km, 8), minutes: Math.max(0, Math.min(600, Number(r.minutes) || 0)),
  };
  if (!route.stops.length) route.stops = ['prima oprire'];
  const slots = (Array.isArray(body.slots) ? body.slots : []).slice(0, 8).map(s => clip(s, 30));
  const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-16)
    .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
    .map(m => ({ role: m.role, content: clip(m.content, 600) }));
  return { p, route, slots, messages };
}

export async function handle(req, { ai = provider(), fetchFn = fetch } = {}) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!ai) return json({ error: 'no API key: set GEMINI_API_KEY or XAI_API_KEY' }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
  const c = cleanRequest(body);
  if (c.error) return json({ error: c.error }, 400);

  // The first call has no messages yet: the guide opens the conversation.
  const messages = c.messages.length ? c.messages
    : [{ role: 'user', content: '(Vizitatorul tocmai a deschis conversația. Salută-l scurt, prezintă-te și propune-i orele la care ești liber.)' }];

  const res = await fetchFn(ai.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ai.key}` },
    // generous token limit: some models spend part of it "thinking" before answering
    body: JSON.stringify({ model: ai.model, temperature: 0.8, max_tokens: 1024,
      messages: [{ role: 'system', content: systemPrompt(c.p, c.route, c.slots) }, ...messages] }),
  });
  if (!res.ok) {
    const detail = clip(await res.text(), 300);
    console.error(ai.name, 'error', res.status, detail);
    return json({ error: ai.name, status: res.status, detail }, 502);
  }
  const data = await res.json();
  const reply = clip(data?.choices?.[0]?.message?.content, 1200).trim();
  return json({ reply: reply || '…' });
}

if (typeof Deno !== 'undefined' && Deno.serve) Deno.serve(req => handle(req));
