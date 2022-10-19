// This is the most primitive and generic ToString operation. It differs
// slightly from String(value) in that it refuses to coerce Symbols.

export default function toString(value) {
  return `${value}`;
}
