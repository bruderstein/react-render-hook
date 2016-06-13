# react-render-hook

`react-render-hook` uses the [React-devtools](https://github.com/facebook/react-devtools) hook to watch for rendering React components,
and provide an interface to get to the virtual DOM tree and find rendered elements and get the metadata about them.

This is meant to be used from libraries that need access to the whole virtual DOM tree, such as testing/assertion libraries.

It is used from [unexpected-react](https://github.com/bruderstein/unexpected-react) as a plugin for [unexpected](http://unexpected.js.org)
to allow assertions over the DOM tree. This package is extracted as a separate package, to allow for other implementations for other assertion
libraries.


This package uses [React-devtools](https://github.com/facebook/react-devtools) as a git submodule, such that it can keep up-to-date with it. However,
only a small part of the devtools is actually used (specifically, the `backend` directory), so it is not anticipated that there will be many updates to this.

# Usage
As React only checks for the global devtools hook when it is first 'required', `react-render-hook` *must* be included *before* `react` is included.
You can validate that this is the case by checking the `isAttached` property.

# API

## isAttached (boolean)

This is set to true when React attaches to the devtools. This should happen immediately after `react` is `require`d.

e.g.
```js
var RenderHook = require('react-render-hook');

assert(RenderHook.isAttached === false);

var React = require('react');

assert(RenderHook.isAttached === true);
```

As `react` is often required as part of components etc, it is recommended to check this property
before calling the other APIs, such that a useful error message can be given to the user.

## findComponent(component)

Returns the `devtools` representation of the `component`.  `component` is the value returned from `React.render()`, or any
valid instance from the children (e.g. `ref`s, etc.).

The `devtools` representation currently has the following properties  (this is currently more-or-less worked out via guess work,
improvements / links to better documentation greatly appreciated)
* `element` - the element instance
* `data` - metadata about the instance. Contains the following important properties
** `nodeType` - the type of node, either `'Native'`, `'Text'` or `'Composite'`  (`'NativeWrapper'` exists too, but that is skipped over and
the `'Native'` child is returned)
** `type` - the type of the element. This corresponds to the `React.createClass` or `class` that extends `React.Component` that
created the element, or is a string value of the native node.
** `name` - tag name of the node
** `props` - props passed to the render method

## findChildren(component)

Returns an array of the `devtools` representation of the `component`'s rendered children. Note that this is not the children passed in to the
render method as the `children` prop, rather the result of the render method of the given component. The `component` parameter can be either a
component instance (like that returned from `React.render()`) or an `devtools` representation of the element, such as that returned from the
`findComponent` method.

## clearAll()

`react-render-hook` maintains an index of mounted components. In a testing scenario, it may be helpful to occassionally clear this index out, as there can be
no way for `react-render-hook` to know that the test is completed and the data can be thrown away.  Memory will continue to be used whenever React renders a
component.

# Contributing

Contributions are very welcome. This project was made without really any knowledge of the devtools internals, so it is not unlikely that some
things are sub-optimal, not best practice, or just plain wrong. The tests show that the rendered content is caught and located by the API.


# License

MIT.
