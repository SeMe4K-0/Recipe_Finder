const CACHE_PREFIX = 'gtx:';

async function translateOne(text: string, sl: string, tl: string): Promise<string> {
  if (!text.trim()) return text;

  const key = `${CACHE_PREFIX}${sl}:${tl}:${text}`;
  const cached = sessionStorage.getItem(key);
  if (cached !== null) return cached;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) return text;

  const data = await res.json();
  // response shape: [[["translated","original",...], ...], ...]
  const translated: string = (data[0] as [string, ...unknown[]][])
    .map((chunk) => chunk[0])
    .join('');

  sessionStorage.setItem(key, translated);
  return translated;
}

export async function translateBatch(texts: string[], sl: string, tl: string): Promise<string[]> {
  return Promise.all(texts.map((t) => translateOne(t, sl, tl)));
}

export const ruToEn = (texts: string[]) => translateBatch(texts, 'ru', 'en');
export const enToRu = (texts: string[]) => translateBatch(texts, 'en', 'ru');
