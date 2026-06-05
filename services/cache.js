const cache = {};

export const setCache = (key, data, ttlSeconds = 60) => {
  cache[key] = {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  };
};

export const getCache = (key) => {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    delete cache[key];
    return null;
  }
  return entry.data;
};

export const clearCache = (key) => {
  if (key) delete cache[key];
  else Object.keys(cache).forEach(k => delete cache[k]);
};