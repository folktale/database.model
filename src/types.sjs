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
 * Provides field types for the model.
 *
 * @module types
 */

// -- Dependencies -----------------------------------------------------
var Base       = require('boo').Base;
var Validation = require('data.validation');
var adt        = require('adt-simple');


// -- Aliases ----------------------------------------------------------
var Success = Validation.Success
var Failure = Validation.Failure


// -- Helpers ----------------------------------------------------------

/**
 * Maps the values of an object.
 *
 * @summary (a → b), { String → a } → { String → b }
 */
function mapObject(f, o) {
  return Object.keys(o).reduce(function(r, k) {
    r[k] = f(r[k])
    return r
  }, Object.create(Object.getPrototypeOf(o)))
}

/**
 * Returns the [[Class]] of an object.
 *
 * @summary Any → String
 */
function classOf(a) {
  return Object.prototype.toString.call(a).slice(8, -1)
}

// -- Underlying database types ----------------------------------------

/**
 * @summary DatabaseType
 */
union DatabaseType {
  DbNull,
  DbText { value: String },
  DbDouble { value: Number },
  DbInt32 { value: Number },
  DbBoolean { value: Boolean },
  DbDate { value: Date },
  DbArray { value: Array },
  DbMap { value: Object },
  DbObjectId { value: String },
  DbCustom { value: Buffer }
} deriving (adt.Base, adt.Cata);

exports.DatabaseType = DatabaseType;


/**
 * Controls the ordering direction of the Cursor
 */
union OrderingDirection {
  Ascending,
  Descending
} deriving (adt.Base, adt.Cata)

exports.OrderingDirection = OrderingDirection


/**
 * Defines an ordering for the Cursor
 */
data Ordering {
  field : *,
  direction : OrderingDirection
} deriving (adt.Base)

exports.Ordering = Ordering


/**
 * Provides a way of writing queries for the database.
 */
union Query {
  And(Query, Query),
  Or(Query, Query),
  Eq(*, DatabaseType)
} deriving (adt.Base, adt.Cata)

exports.Query = Query


// -- Core types -------------------------------------------------------

var FieldType = Base.derive({
  /**
   * Specialises the type for a particular field.
   *
   * @summary String → FieldType
   */
  forField: function(name) {
    return this.derive({ name: name, dbName: name })
  }
  
  /**
   * Validates the data structure.
   *
   * @summary a → Validation(FieldValidationError, a)
   */
, validation: function(a) {
    return Success(a);
  }

, /**
   * Prepares the data structure to be stored in the database.
   *
   * @summary a → Validation(MarshallingError, DatabaseType)
   */
  marshall: function(a) {
    return Failure(new Error('not implemented'));
  }

, /**
   * Enriches a value read from the database for manipulation in JS.
   *
   * @summary DatabaseType → Validation(UnmarshallingError, a)
   */
  unmarshall: function(a) {
    return Failure(new Error('not implemented'));
  }
});
exports.FieldType = FieldType;

var FtNull = FieldType.derive({
  marshall: function(a) {
    return a == null?        Success(DbNull)
    :      /* otherwise */   Failure(new Error('Invalid type for Null field.'));
  }

, unmarshall: function {
    DbNull => Success(null),
    *      => Failure(new Error('Invalid database type for Null field.'))
  }
})
exports.FtNull = FtNull;

var FtString = FieldType.derive({
  marshall: function(a) {
    return classOf(a) === 'String'?  Success(DbText(a))
    :      /* otherwise */           Failure(new Error('Invalid type for String field.'));
  }

, unmarshall: function {
    DbText(a) => Success(a),
    *         => Failure(new Error('Invalid database type for String field.'))
  }
});
exports.FtString = FtString;

var FtDouble = FieldType.derive({
  marshall: function(a) {
    return classOf(a) === 'Number'?  Success(DbDouble(a))
    :      /* otherwise */           Failure(new Error('Invalid type for Double field.'));    
  }

, unmarshall: function {
    DbDouble(a) => Success(a),
    *           => Failure(new Error('Invalid database type for Double field.'))
  }
});
exports.FtDouble = FtDouble;

var FtInt = FieldType.derive({
  marshall: function(a) {
    return classOf(a) === 'Number'?  Success(DbInt32(a | 0))
    :      /* otherwise */           Failure(new Error('Invalid type for Int field.'));
  }

, unmarshall: function {
    DbInt32(a) => Success(a),
    *          => Failure(new Error('Invalid database type for Int field.'))
  }
});
exports.FtInt = FtInt;

var FtBoolean = FieldType.derive({
  marshall: function(a) {
    return classOf(a) === 'Boolean'?  Success(DbBoolean(a))
    :      /* otherwise */            Failure(new Error('Invalid type for Boolean field.'));
  }

, unmarshall: function {
    DbBoolean(a) => Success(a),
    *            => Failure(new Error('Invalid database type for Boolean field.'))
  }
});
exports.FtBoolean = FtBoolean;

var FtDate = FieldType.derive({
  marshall: function(a) {
    return classOf(a) === 'Date'?  Success(DbDate(a))
    :      /* otherwise */         Failure(new Error('Invalid type for Date field.'));
  }

, unmarshall: function {
    DbDate(a) => Success(a),
    *         => Failure(new Error('Invalid database type for Date field.'))
  }
});
exports.FtDate = FtDate;

var FtArray = function(Type) {
  return FieldType.derive({
    marshall: function(xs) {
      return classOf(a) === 'Array'?  Success(DbArray(xs.map(Type.marshall)))
      :      /* otherwise */          Failure(new Error('Invalid type for Array field.'));
    }

  , unmarshall: function {
      DbArray(xs) => Success(xs.map(Type.unmarshall)),
      *           => Failure(new Error('Invalid database type for Array field.'))
    }
  })
};
exports.FtArray = FtArray;

var FtMap = function(Type) {
  return FieldType.derive({
    marshall: function(xs) {
      return Object(xs) === xs?  Success(mapObject(Type.marshall, xs))
      :      /* otherwise */     Failure(new Error('Invalid type for Map field.'));
    }

  , unmarshall: function {
      DbMap(xs) => Success(mapObject(Type.unmarshall, xs)),
      *         => Failure(new Error('Invalid database type for Map field.'))
    }
  })
};
exports.FtMap = FtMap;

var FtObjectId = function(Type) {
  return FieldType.derive({
    marshall: function(a) {
      return classOf(a) === 'String'?  Success(DbObjectId(a.toString()))
      :      /* otherwise */           Failure(new Error('Invalid type for ObjectID field.'));
    }

  , unmarshall: function {
      DbObjectId(a) => Success(a),
      *             => Failure(new Error('Invalid database type for ObjectID field.'))
    }
  })
};
exports.FtObjectId = FtObjectId;
