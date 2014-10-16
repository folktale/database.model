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

var _ = require('../../lib/types');
var $ = require('alright');
var {forAll, sized, choice, data: { Any }} = require('claire');

var Anys = sized(λ[10], Any);

module.exports = spec 'Types' {
  spec 'Fields' {
    it 'FieldType#forField(s) should create a field with that name.' {
      _.FieldType.forField('foo').name => 'foo';
      _.FieldType.forField('bar').dbName => 'bar';
    }

    it 'FieldType#validation(a) should always succeed.' {
      forAll(Anys).satisfy(λ(a) ->
        !!(_.FieldType.validation(a).get() => a)
      ).asTest()()
    }

    it 'FieldType#marshall(a) should always fail.' {
      forAll(Anys, Anys).satisfy(λ(a, b) ->
        !!(_.FieldType.marshall(a).getOrElse(b) => b)
      ).asTest()()
    }

    it 'FieldType#unmarshall(a) should always fail.' {
      forAll(Anys, Anys).satisfy(λ(a, b) ->
        !!(_.FieldType.unmarshall(a).getOrElse(b) => b)
      ).asTest()()
    }

    spec 'Null' {
      it '#marshall(a) should succeed for null/undefined' {
        _.FtNull.marshall(null).get() => _.DatabaseType.DbNull;
        _.FtNull.marshall(undefined).get() => _.DatabaseType.DbNull;
      }

      it '#marshall(a) should fail for non null/undefined' {
        forAll(Anys, Anys).given(λ[# != null]).satisfy(λ(a, b) ->
          !!(_.FtNull.marshall(a).getOrElse(b) => b)
        ).asTest()()
      }

      it '#unmarshall(a) should succeed for DbNull' {
        _.FtNull.unmarshall(_.DatabaseType.DbNull).get() => null
      }

    }
  }
}
