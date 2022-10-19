import { createElement } from 'react';
import escapeScriptTerminator from '../dom/escape-script-terminator.mjs';
import isUndefined from '../check/is-undefined.mjs';
import toString from '../coerce/to-string.mjs';

const MEDIA_TYPE_JS = 'text/javascript',
  MEDIA_TYPE_LD = 'application/ld+json';

const INIT_QUEUE = /*syntax:js*/ `w=self._wq=self._wq||[];`;

const CACHE_MEDIA = /*syntax:js*/ `function $(d){w.push(function(w){w.cacheMedia(d.hashedId,d)})}`;

////////////////////////////////////////////////////////////////////////////////
//
// Like the HeadManager, HeadResult is an internal API. The only deliberately
// exposed portion is the result of HeadResult.prototype.finalize, which is also
// the resolution value of HeadManager.prototype.finalize.
//
// Both HeadManager and HeadResult model state. The relationship is 1:1, so the
// distinction may not be obvious. The difference is that HeadManager models the
// data collected during an ordinary render (e.g. facts like “a wistia video
// with the ID 123 was embedded”) while the HeadResult models the vdom generated
// asynchronously from HeadManager’s collected metadata (e.g. objects like “a
// vdom node for a script that embeds JSON data for a wistia video with the ID
// 123”):
//
// 1. HeadManager collects metadata during render [sync or async]
// 2a. HeadManager.finalize() uses metadata to load API data [async]
// 2b. ...and records the results in its HeadResult as they become available.
// 3. HeadResult.finalize() returns final consumable head elements [sync]

export class HeadResult {
  constructor({ url }) {
    this.url = url;
  }

  canonical = undefined;
  head = [];
  cacheStatements = [];
  seriesRelations = new Map();
  title = undefined;
  url = undefined;

  addCachedMediaStatement(data) {
    const { hashedId } = data;
    this.cacheStatements.push(`$(${JSON.stringify(data)});`);
  }

  addExternalScript(src) {
    this.head.push(<script async={true} key={src} src={src} type={MEDIA_TYPE_JS} />);
  }

  addLinkedDataScript(data) {
    const key = data.hashedId;
    const html = { __html: escapeScriptTerminator(JSON.stringify(data)) };

    this.head.push(<script dangerouslySetInnerHTML={html} key={key} type={MEDIA_TYPE_LD} />);
  }

  setCanonical(...preservedKeys) {
    if (isUndefined(this.url)) {
      return;
    }

    const url = new URL(this.url);

    url.search = '';

    for (const key of preservedKeys) {
      url.searchParams.set(key, this.url.searchParams.get(key));
    }

    this.canonical = <link href={url.href} key="canonical" rel="canonical" />;
  }

  setSeriesRelation(rel, usp) {
    if (isUndefined(this.url)) {
      return;
    }

    const url = new URL(this.url);

    url.search = usp;

    this.seriesRelations.set(rel, <link href={url.href} key={rel} rel={rel} />);
  }

  setTitle(...items) {
    const title = items
      .map((item) => Object(item).title)
      .filter(Boolean)
      .map((item) => toString(item).trim())
      .filter(Boolean)
      .join(' - ');

    if (title) {
      this.title = <title key="wistia-title">{title}</title>;
    }
  }

  finalize() {
    if (this.canonical) {
      this.head.push(this.canonical);
    }

    for (const link of this.seriesRelations.values()) {
      this.head.push(link);
    }

    if (this.cacheStatements.length !== 0) {
      const statements = [INIT_QUEUE, CACHE_MEDIA, ...this.cacheStatements];
      const js = `!function(w){${statements.join('')}}()`;
      const key = 'wistia-cache';
      const html = { __html: escapeScriptTerminator(js) };

      this.head.push(<script dangerouslySetInnerHTML={html} key={key} type={MEDIA_TYPE_JS} />);
    }

    return {
      head: this.head,
      title: this.title,
      updateNextJsTitle: updateNextJsTitle.bind(this),
      [Symbol.toStringTag]: 'WistiaHeadResult',
    };
  }
}

////////////////////////////////////////////////////////////////////////////////

function updateNextJsTitle(head) {
  if (this.title) {
    let index = head.findIndex((node) => node.type === 'title');

    if (index === -1) {
      index = head.length;
    }

    head[index] = this.title;
  }
}
