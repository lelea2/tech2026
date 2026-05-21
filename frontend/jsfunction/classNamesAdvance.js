// classnames is a commonly-used utility in modern front end applications to conditionally join CSS class names together. 
// If you've written React applications, you likely have used a similar library.

/**
 * @typedef {Record<string, unknown>} ClassDictionary
 * @typedef {Array<ClassValue>} ClassArray
 * @typedef {string | number | null | boolean | undefined | (() => unknown) | ClassDictionary | ClassArray} ClassValue
 */

/**
 * @param {...ClassValue} args
 * @returns {string}
 */
export default function classNames(...args) {
  const result = new Set();

  function add(name) {
    if (typeof name !== 'string' || name.length === 0) {
      return;
    }
    result.add(name);
  }

  function remove(name) {
    if (typeof name !== 'string' || name.length === 0) {
      return;
    }
    result.delete(name);
  }

  function process(value) {
    if (!value) {
      return;
    }
    // string
    if (typeof value === 'string') {
      add(value);
      return;
    }

    // integer
    if (typeof value === 'number') {
      if (value) {
        add(`${value}`); // translate number to string
        return;
      }
    }
    // array
    if (Array.isArray(value)) {
      // recursive loop process each item type in array
      for (const item of value) {
        process(item);
      }
      return;
    }
    // function 
    if (typeof value === 'function') {
        process(value());
        return;
    }

    // object
    if (typeof value === 'object') {
      for (const key in value) {
        if (value[key]) {
          add(key);
        } else {
          remove(key);
        }
      }
    }
  }

  for (const arg of args) {
    process(arg);
  }
  return Array.from(result).join(' ');
}



```
classNames('foo', 'foo'); // 'foo'
classNames({ foo: true }, { foo: true }); // 'foo'
classNames({ foo: true, bar: true }, { foo: false }); // 'bar'
classNames('foo', () => 'bar'); // 'foo bar'
classNames('foo', () => 'foo'); // 'foo'

```