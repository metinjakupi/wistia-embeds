# Wistia component wrappers for React

Wistia provides embed libraries that decorate DOM nodes based on selectors. This
traditional, jQuery-style strategy presents the least friction for the majority
of our users (most of whom have static sites), but it doesn’t always play nicely
out of the box with SPAs.

This library is not a reimplementation of the Wistia player and other “embeds”
in React. The player, channels, etc are still managed by the usual Wistia
libraries. Rather this is a glue layer to help ensure correct behavior in the
context of a React application. It aims to:

- load the correct scripts (only if needed, and only once)
- correctly key vdom nodes so that they destructively rerenders when appropriate
- prevent race conditions when hydration is in play
- be compatible with server-side rendering

It’s the last of these which is most notable. The first few wouldn’t be hard for
the typical React developer to devise ad hoc, but the SSR part requires some
knowledge of APIs used by the Wistia player. Also, because it’s happening on the
backend, this functionality goes beyond what the Wistia embeds on their own can
provide.

Using `@wistia/react-embeds` in an app that does universal rendering, you can get your
video-related SEO data into the server-rendered HTML, which means scrapers that
don’t evaluate JS will still pick the information up. This is particularly
useful for our new “channels” feature where it can improve the quality of link
previews on social media platforms.

## Quick Start Guide

```bash
npm install @wistia/react-embeds
```

Rendering a Wistia video

```jsx
<WistiaProvider>
  <WistiaPlayer hashedId="abc123">
</WistiaProvider>
```

Rendering a Wistia Channel

```jsx
<WistiaProvider>
  <WistiaChannel hashedId="abc123">
</WistiaProvider>
```

## The components

There are presently three components:

- `<WistiaPlayer>`
- `<WistiaChannel>`
- `<WistiaProvider>`

Both the `<WistiaPlayer>` and `<WistiaChannel>` components can be used for both
ordinary (“inline”) embeds and modal embeds (“popovers”).

The `<WistiaProvider>` component should appear once, likely at or near the root
of the app; all other components should be descendants of it. If you’re doing
SSR, you’ll need to provide it with two props: a throw-away context object (it
will be mutated) and the initial href (it does not need to be updated since it
is only used during the SSR initial render).

Using the SEO head elements can be tricky. If you have used certain CSS-in-React
libraries before, the pattern may be familiar, but there’s an extra rub because
extracting the final data is an asynchronous operation.

### WistiaPlayer

The `<WistiaPlayer>` component takes the same options (as React props) which
one can set using `class=` on “raw” wistia embeds. There is a list at the
[Embed options](https://wistia.com/support/developers/embed-options) support
page. The only difference here is that numbers, booleans, etc are expected to
be JS values of those types rather than strings.

The only required prop is `hashedId`, the ID of the video media that will be
embedded.

Some defaults are special-cased to improve ergonomics for React apps:

- Wistia’s “popovers” are video embeds that open in modal overlays when a target
  element is clicked. There is an explicit, _required_ `popover` prop/option (`true`/`false`) as well as an optional `popoverContent` prop, but if left
  undefined, the default `popoverContent` value is `thumbnail`. For popovers with `popoverContent="link`, the `<WistiaPlayer>` component expects to have children.

```js
<WistiaPlayer hashedId="abc123" popover={true} popoverContent="link">
  <span>Popover Link</span>
</WistiaPlayer>
```

- Wistia’s `videoFoam` option is used to make video embeds responsive. It’s
  unusual to not want this behavior, so it defaults to `true` if it has not been
  explicitly defined. if `videoFoam` is set to `false`, explicit `width` and `height` values should
  be passed in as an object to th `style` prop.

```js
<WistiaPlayer
  hashedId="abc123"
  videoFoam={false}
  style={{
    width: '640px',
    height: '360px',
  }}
/>
```

### WistiaChannel

The `<WistiaChannel>` component works the same way as the player. This is a new
feature at the time of writing this and the options are not all documented yet.
Aside from `hashedId`, the main option of interest is `mode`, which controls
whether the channel appears _inline_ or as a preview link card that opens an
_overlay_.

## Requirements

This makes use of the Context API that was introduced in React 16.3.0. Both
react and prop-types are peer dependencies, though the latter is not imported in
the production builds.

A reasonably current ES environment is expected. Polyfills aren’t included here
since this would possibly be redundant or unnecessary depending on your usage.
In the client, `URL`, `URLSearchParams`, and various ES2015 methods are
employed (e.g. `Object.assign`), but we’ve avoided anything that would introduce
dependencies on regenerator runtime or other notoriously finnicky runtime
polyfills so as long as you’re either only targeting modern browsers or are
using @babel/polyfill it should be solid down to IE11. On the node side, we make
use of async functions and ES2019 methods; the expectation is that you’re either
using Node 11 or are using >= 8 but have polyfilled through ES2019.

## Implementation notes

Neither `<WistiaPlayer>` nor `<WistiaChannel>` produce any DOM nodes until
_after_ mount. This isn’t super intuitive and merits some explanation.

The SSR support here refers to (a) general compatibility with SSR and (b) the
special provisions made by `<WistiaProvider>` for generating head elements for
SEO and linking, not (c) pre-rendering the child DOM tree normally generated by
the Wistia libraries in the client. This third item would be very hard for us to
pull off at the moment, especially while remaining framework agnostic.

Well, that explains why complete SSR isn’t happening here, but it doesn’t
explain why we don’t even generate the “hook” (the element with the
`wistia_embed_xxxx` class) during SSR.

This is because the player lib is loaded “outside” your own application. It
isn’t a normal dependency, and network and caching variations may lead to it
loading before or after your own app’s code. Most often it will load first. If
the player does load first and the selector hook is already present, the player
will begin adding new DOM nodes inside that target element. When your app then
tries to hydrate, React will see the elements added by the player as a
discrepancy and remove them.

In other words, we defer inclusion of the hook until after mount because it’s
the earliest time when we’re certain React’s hydration has taken place, and any
other approach produces race conditions that may lead to visible flicker,
autoplay failure, etc.

We may be able to improve this behavior in time.
