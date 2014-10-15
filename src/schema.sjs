// Copyright (c) 2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/**
 * Provides a way of modelling collections of data.
 *
 * @module schema
 */

// -- Dependencies -----------------------------------------------------
var Base       = require('boo').Base;
var curry      = require('core.lambda').curry;
var unary      = require('core.arity').unary;
var binary     = require('core.arity').binary;
var Validation = require('data.validation');

// -- Aliases ----------------------------------------------------------
var Success = Validation.Success;
var Failure = Validation.Failure;

// -- Helpers ----------------------------------------------------------

/**
 * Captures all variadic arguments in an array.
 *
 * @summary a... → [a]
 */
function toArray() {
  return [].slice.call(arguments)
}

/**
 * Collects all data in a single validation.
 *
 * @summary [Validation(a, b)] → Validation([a], [b])
 */
function collect(xs) {
  return xs.map(forceNEL).reduce( binary(ap)
                                , Success(curry(xs.length, toArray)))
}

/**
 * Applies an applicative.
 *
 * @summary Applicative f => f (a → b) → f a → f b
 */
ap = curry(2, ap);
function ap(f, a) {
  return f.ap(a)
}

/**
 * Forces things to be in a non-empty list.
 *
 * @summary a → [a]
 * @summary [a] → [a]
 */
function forceNEL(a) {
  return a.leftMap(function(va) {
    return Array.isArray(va)? va : [va]
  })
}

/**
 * Marshalls some data through a field type.
 *
 * @summary Object → FieldType → Validation(MarshallingError, DatabaseType)
 */
var marshall = curry(2, marshall);
function marshall(data, type) {
  return type.name in data?  type.marshall(data[type.name])
  :      /* otherwise */     Failure(new Error('Non existing field: ' + type.name))
}

/**
 * Unmarshalls some data.
 *
 * @summary [(FieldType, DatabaseType)] → [Validation(UnmarshallingError, (FieldType, a))]
 */
function unmarshall(xss) {
  return xss.map(function {
    [type, data] => [type, type.unmarshall(data)]
  })
}

/**
 * Zips two arrays together.
 *
 * @summary [a] → [b] → [(a, b)]
 */
var zip = curry(2, zip)
function zip(xs, ys) {
  return xs.map(function(x, i) {
    return [x, ys[i]]
  })
}

/**
 * Transforms a list of tuples into an object.
 *
 * @summary [(FieldType, a)] → { String → a }
 */
function toObjet(xss) {
  return xss.reduce(function(o, pair) {
    o[pair[0].name] = pair[1];
    return o
  }, {})
}


// -- Core implementation ----------------------------------------------
var Schema = Base.derive({
  /**
   * Constructs an instance of a schema.
   *
   * @summary String, [FieldType] → Schema
   */
  forCollection: function(name, fields) {
    return this.derive({ name: name, fields: fields })
  }

, /**
   * Converts the data structures to the ones understood by the DB backend.
   *
   * @summary a → Validation(MarshallingError, [(FieldType, DatabaseType)])
   */
  marshall: function(data) {
    return collect(this.fields.map(unary(marshall(data)))).map(zip(this.fields))
  }

, /**
   * Converts data from the DB backend to JS.
   *
   * @summary [DatabaseType] → Validation(UnmarshallingError, a)
   */
  unmarshall: function(xs) {
    return collect(zip(this.fields, xs).map(unmarshall)).map(toObject)
  }
});
exports.Schema = Schema;
