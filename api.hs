-- Schemas are composed of fields
type FieldType a where
  name       :: String  -- The name of the field in JS
  dbName     :: String  -- The name of the field in the Database
  validation :: a → Validation(FieldValidationError, a)
  marshall   :: a → Validation(MarshallingError, DatabaseType)
  unmarshall :: DatabaseType → Validation(UnmarshallingError, a)

-- Which maps values to database types
type DatabaseType = DbNull
                  | DbText String
                  | DbDouble Number
                  | DbInt32 Number
                  | DbBoolean Boolean
                  | DbDate Date
                  | DbArray [DatabaseType]
                  | DbMap { String -> DatabaseType }
                  | DbObjectId String                     -- for MongoDB
                  | DbCustom Buffer                       -- Anything else

-- And we have a layer on top to provide something similar for all DBs
type Schema = [FieldType]

-- Collection and Cursor are specific to the database backend
type Collection a where
  create :: Schema → Object → Future(DBError, a)
  save   :: a → Future(DBError, a)
  delete :: a → Future(DBError, a)
  find   :: Query → Schema → Cursor

type Cursor a where
  skip    :: Int → Cursor → Cursor
  limit   :: Int → Cursor → Cursor
  orderBy :: Ordering → Cursor → Cursor
  values  :: Cursor → [a]
  first   :: Cursor → Maybe(a)

type Ordering where
  field     :: FieldType
  direction :: OrderingDirection
  
type OrderingDirection = Ascending | Descending

type Query = And(Query, Query)
           | Or(Query, Query)
           | Eq(FieldType, DatabaseType)


  
