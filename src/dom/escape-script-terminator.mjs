// Text within <script> is terminated only by </script* (and only then when not
// within a comment-like sequence, but that’s not important in context). For
// both JSON and JS this can be backslash-escaped anywhere it would be valid to
// prevent premature termination due to the JS/JSON source text.
//
// https://html.spec.whatwg.org/multipage/parsing.html#appropriate-end-tag-token

export default function escapeScriptTerminator(src) {
  return src.replace(/<\/script(?=[\f\t />]|$)/gi, '<\\/script');
}
