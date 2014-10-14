database.model
==============

[![Build Status](https://secure.travis-ci.org/folktale/database.model.png?branch=master)](https://travis-ci.org/folktale/database.model)
[![NPM version](https://badge.fury.io/js/database.model.png)](http://badge.fury.io/js/database.model)
[![Dependencies Status](https://david-dm.org/folktale/database.model.png)](https://david-dm.org/folktale/database.model)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)


A safe database modelling layer with validation and marshalling for multiple database backends.


## Example

```js
( ... )
```


## Installing

The easiest way is to grab it from NPM. If you're running in a Browser
environment, you can use [Browserify][]

    $ npm install database.model


### Using with CommonJS

If you're not using NPM, [Download the latest release][release], and require
the `database.model.umd.js` file:

```js
var Model = require('database.model')
```


### Using with AMD

[Download the latest release][release], and require the `database.model.umd.js`
file:

```js
require(['database.model'], function(Model) {
  ( ... )
})
```


### Using without modules

[Download the latest release][release], and load the `database.model.umd.js`
file. The properties are exposed in the global `Folktale.Database.Model` object:

```html
<script src="/path/to/database.model.umd.js"></script>
```


### Compiling from source

If you want to compile this library from the source, you'll need [Git][],
[Make][], [Node.js][], and run the following commands:

    $ git clone git://github.com/folktale/database.model.git
    $ cd database.model
    $ npm install
    $ make bundle
    
This will generate the `dist/database.model.umd.js` file, which you can load in
any JavaScript environment.

    
## Documentation

You can [read the documentation online][docs] or build it yourself:

    $ git clone git://github.com/folktale/database.model.git
    $ cd database.model
    $ npm install
    $ make documentation

Then open the file `docs/index.html` in your browser.


## Platform support

This library assumes an ES5 environment, but can be easily supported in ES3
platforms by the use of shims. Just include [es5-shim][] :)


## Licence

Copyright (c) 2014 Quildreen Motta.

Released under the [MIT licence](https://github.com/folktale/database.model/blob/master/LICENCE).

<!-- links -->
[Fantasy Land]: https://github.com/fantasyland/fantasy-land
[Browserify]: http://browserify.org/
[Git]: http://git-scm.com/
[Make]: http://www.gnu.org/software/make/
[Node.js]: http://nodejs.org/
[es5-shim]: https://github.com/kriskowal/es5-shim
[docs]: http://folktale.github.io/database.model
<!-- [release: https://github.com/folktale/database.model/releases/download/v$VERSION/database.model-$VERSION.tar.gz] -->
[release]: https://github.com/folktale/database.model/releases/download/v0.0.0/database.model-0.0.0.tar.gz
<!-- [/release] -->
