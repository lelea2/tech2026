/**
 * Custom implementation of Function.prototype.call.
 *
 * Usage:
 * fn.myCall(thisArg, ...args)
 *
 * @param {unknown} thisArg
 * @param {...unknown} args
 * @returns {unknown}
 */
Function.prototype.myCall = function (thisArg, ...argArray) {
	if (typeof this !== 'function') {
		throw new TypeError('myCall must be called on a function');
	}

	// Match call/apply behavior: null/undefined default to global object;
	// primitives are boxed.
	const context =
		thisArg === null || thisArg === undefined ? globalThis : Object(thisArg);

	const tempKey = Symbol('myCall');
	context[tempKey] = this;

	try {
		return context[tempKey](...argArray);
	} finally {
		delete context[tempKey];
	}
};

/**
Example:

function greet(greeting, punctuation) {
	return `${greeting}, ${this.name}${punctuation}`;
}

greet.myCall({ name: 'Ada' }, 'Hello', '!');
// 'Hello, Ada!'
*/
