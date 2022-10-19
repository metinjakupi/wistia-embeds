// The src comparison is made using HTMLScriptElement.prototype.src rather than
// baking it into the selector because HTMLScriptElement.prototype.src will be
// the canonicalized URL. The serialized HTML src attribute value may not be in
// canonical form.

export default function addScriptIfAbsent(src) {
  const scripts = Array.from(document.getElementsByTagName('script'));
  const script = Object.assign(document.createElement('script'), { src });

  if (scripts.every((existingScript) => existingScript.src !== script.src)) {
    document.head.appendChild(script);
  }
}
