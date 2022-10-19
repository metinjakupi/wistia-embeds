import toString from './to-string.mjs';

// Coerce URL origin string. Allows for but fixes empty pathname and ensures
// canonicalization.

export default function toOrigin(origin) {
  origin = toString(origin);

  try {
    const url = new URL(origin);

    if (url.href === `${url.origin}/`) {
      return url.origin;
    }
  } catch {}

  throw new URIError(`${JSON.stringify(origin)} is not a valid URL origin`);
}
