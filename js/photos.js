// Picks the best available real photo for a place, in this order:
//   1. a photo the user added on this device
//   2. the "photo" column of the location CSV (local file in assets/photos or a URL)
//   3. the lead image of the Wikipedia article in the "wikipedia" column (placeholder)
// If none load, the caller shows a "no photo yet" panel.

import { WIKI_SUMMARY, WIKI_IMAGE_WIDTH } from './config.js';

const wikiCache = new Map();

// spec looks like "en:Arad_Administrative_Palace" (language optional, defaults to en).
async function wikiPhotos(spec) {
  if (wikiCache.has(spec)) return wikiCache.get(spec);
  const job = (async () => {
    const m = spec.match(/^([a-z]{2,3}):(.+)$/);
    const lang = m ? m[1] : 'en', title = (m ? m[2] : spec).replace(/ /g, '_');
    try {
      const res = await fetch(WIKI_SUMMARY(lang, title));
      if (!res.ok) return [];
      const j = await res.json();
      const page = (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page) || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`;
      const credit = { credit: 'Fotografie provizorie de pe Wikipedia', link: page };
      const out = [];
      if (j.thumbnail && j.thumbnail.source) {
        out.push({ src: j.thumbnail.source.replace(/\/\d+px-/, `/${WIKI_IMAGE_WIDTH}px-`), ...credit });
        out.push({ src: j.thumbnail.source, ...credit });
      }
      if (j.originalimage && j.originalimage.source) out.push({ src: j.originalimage.source, ...credit });
      return out;
    } catch { return []; }
  })();
  wikiCache.set(spec, job);
  return job;
}

function loads(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 1);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

// Resolves to { src, credit, link, own } or null.
export async function findPhoto(place, ownPhoto) {
  if (ownPhoto) return { src: ownPhoto, credit: 'Fotografia ta', own: true };
  const candidates = [];
  if (place.photo) candidates.push({ src: place.photo, credit: place.photoCredit || 'Fotografie' });
  for (const c of candidates) if (await loads(c.src)) return c;
  if (place.wikipedia) {
    for (const c of await wikiPhotos(place.wikipedia)) if (await loads(c.src)) return c;
  }
  return null;
}

export const searchPhotosUrl = place =>
  'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(place.name + ' Arad');

// Shrinks a picked image file to a JPEG data URL so it fits in browser storage.
export function fileToDataUrl(file, maxSide = 900) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('read failed'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('not an image'));
      img.onload = () => {
        const k = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
