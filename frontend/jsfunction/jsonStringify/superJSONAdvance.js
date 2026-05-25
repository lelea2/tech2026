/**
 * Advanced SuperJSON-style serializer.
 *
 * Preserves:
 * - JSON values
 * - undefined
 * - NaN, Infinity, -Infinity
 * - BigInt
 * - Date
 * - RegExp
 * - Map
 * - Set
 *
 * Supported containers: dense arrays, plain objects, Map, Set.
 * Out of scope: cyclic references, functions, symbols, class instances.
 */

/**
 * @param {unknown} value
 * @returns {string}
 */
export function serialize(value) {
	return JSON.stringify(encode(value));
}

/**
 * @param {string} serialized
 * @returns {unknown}
 */
export function deserialize(serialized) {
	return decode(JSON.parse(serialized));
}

/**
 * @param {unknown} value
 * @returns {{t: string, v?: unknown}}
 */
function encode(value) {
	if (value === undefined) {
		return { t: 'undefined' };
	}

	if (value === null) {
		return { t: 'null' };
	}

	const valueType = typeof value;

	if (valueType === 'string') {
		return { t: 'string', v: value };
	}

	if (valueType === 'boolean') {
		return { t: 'boolean', v: value };
	}

	if (valueType === 'number') {
		if (Number.isNaN(value)) {
			return { t: 'nan' };
		}

		if (value === Infinity) {
			return { t: 'infinity' };
		}

		if (value === -Infinity) {
			return { t: 'negInfinity' };
		}

		return { t: 'number', v: value };
	}

	if (valueType === 'bigint') {
		return { t: 'bigint', v: value.toString() };
	}

	if (Array.isArray(value)) {
		return { t: 'array', v: value.map((item) => encode(item)) };
	}

	if (value instanceof Date) {
		return { t: 'date', v: value.getTime() };
	}

	if (value instanceof RegExp) {
		return { t: 'regexp', v: { source: value.source, flags: value.flags } };
	}

	if (value instanceof Map) {
		const entries = [];

		for (const [key, mapValue] of value.entries()) {
			entries.push([encode(key), encode(mapValue)]);
		}

		return { t: 'map', v: entries };
	}

	if (value instanceof Set) {
		const items = [];

		for (const setValue of value.values()) {
			items.push(encode(setValue));
		}

		return { t: 'set', v: items };
	}

	if (isPlainObject(value)) {
		const entries = Object.entries(value).map(([key, objectValue]) => [
			key,
			encode(objectValue),
		]);

		return { t: 'object', v: entries };
	}

	throw new TypeError('Unsupported value type for serialization');
}

/**
 * @param {{t: string, v?: unknown}} node
 * @returns {unknown}
 */
function decode(node) {
	switch (node.t) {
		case 'undefined':
			return undefined;
		case 'null':
			return null;
		case 'string':
		case 'boolean':
		case 'number':
			return node.v;
		case 'nan':
			return NaN;
		case 'infinity':
			return Infinity;
		case 'negInfinity':
			return -Infinity;
		case 'bigint':
			return BigInt(/** @type {string} */ (node.v));
		case 'date':
			return new Date(/** @type {number} */ (node.v));
		case 'regexp': {
			const regexpNode = /** @type {{source: string, flags: string}} */ (node.v);
			return new RegExp(regexpNode.source, regexpNode.flags);
		}
		case 'array':
			return /** @type {Array<any>} */ (node.v).map((child) => decode(child));
		case 'object': {
			const out = {};
			for (const [key, child] of /** @type {Array<[string, any]>} */ (node.v)) {
				out[key] = decode(child);
			}
			return out;
		}
		case 'map': {
			const out = new Map();
			for (const [encodedKey, encodedValue] of /** @type {Array<[any, any]>} */ (node.v)) {
				out.set(decode(encodedKey), decode(encodedValue));
			}
			return out;
		}
		case 'set': {
			const out = new Set();
			for (const encodedItem of /** @type {Array<any>} */ (node.v)) {
				out.add(decode(encodedItem));
			}
			return out;
		}
		default:
			throw new TypeError('Invalid serialized payload');
	}
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
	if (value === null || typeof value !== 'object') {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

export default {
	serialize,
	deserialize,
};
