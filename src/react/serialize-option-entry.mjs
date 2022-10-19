// Serializing React props to wistia class option syntax is generally similar to
// serializing query parameters except that the member delimiter is whitespace
// rather than ampersand. Keys are fixed, whitelisted values that we know do not
// need URI encoding.
//
// The videoFoam option is a unique case because its value can be JSON. To
// account for this, if the key is videoFoam and the value is an object, we
// assume it should be serialized to JSON rather than coerced to string as we do
// for all other values.

export default function serializeOptionEntry([key, value]) {
  if (key === 'videoFoam' && Object(value) === value) {
    value = JSON.stringify(value);
  }

  return `${key}=${encodeURIComponent(value)}`;
}
