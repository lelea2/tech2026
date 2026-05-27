//Implement a function conformsTo(object, source) that checks if object conforms to source by invoking 
// the predicate properties of source with the corresponding property values of object.
/**
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property predicates to conform to.
 * @returns {boolean} Returns true if object conforms, else false.
 */
export default function conformsTo(object, source) {
  if (object == null || typeof object !== 'object' || Object.keys(object).length === 0) {
    return false;
  }

  for (const key of Object.keys(source)) {
    const predicate = source[key];
    // Predicate must return true for coressponding object value
    if (!predicate(object[key])) {
      return false;
    }
  }
  return true;
}

/**
conformsTo({ a: 1, b: 2 }, { b: (n) => n > 1 });
// => true

conformsTo({ a: 1, b: 2 }, { b: (n) => n > 2 });
// => false
 */