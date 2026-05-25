/**
 * MiniORM III:
 * - Dynamic delegates from model names in constructor data.
 * - findMany supports where, orderBy, select, include.
 * - create/update/delete behavior is unchanged from previous versions.
 */
export default class MiniORM {
	/**
	 * @param {Record<string, Array<Record<string, unknown>>>} data
	 * @param {Record<string, Record<string, {
	 *   model: string,
	 *   type: 'one' | 'many',
	 *   sourceKey: string,
	 *   targetKey: string,
	 * }>>} [relations]
	 */
	constructor(data, relations = {}) {
		/** @type {Record<string, Array<Record<string, unknown>>>} */
		this._store = {};
		this._relations = relations || {};

		for (const [modelName, records] of Object.entries(data || {})) {
			// Clone initial records so external mutations do not affect storage.
			this._store[modelName] = records.map((record) => ({ ...record }));
			this[modelName] = this._createDelegate(modelName);
		}
	}

	/**
	 * @param {string} modelName
	 */
	_createDelegate(modelName) {
		return {
			findMany: (args = {}) => {
				const table = this._store[modelName] || [];
				const where = args.where;
				const orderBy = args.orderBy;
				const select = args.select;
				const include = args.include;

				let results = table;

				if (where) {
					results = results.filter((record) => matchesWhereEnhanced(record, where));
				}

				if (orderBy) {
					const [field, direction] = Object.entries(orderBy)[0];
					const sortFactor = direction === 'asc' ? 1 : -1;

					// Sort after filtering; keep storage order intact.
					results = [...results].sort((a, b) => {
						if (a[field] === b[field]) {
							return 0;
						}

						return a[field] < b[field] ? -1 * sortFactor : 1 * sortFactor;
					});
				}

				return results.map((record) => {
					const shaped = select ? pickSelectedFields(record, select) : { ...record };

					if (include) {
						this._attachIncludes(modelName, record, shaped, include);
					}

					return shaped;
				});
			},

			create: ({ data }) => {
				const table = this._store[modelName];
				const created = { ...data };
				table.push(created);
				return { ...created };
			},

			update: ({ where, data }) => {
				const table = this._store[modelName];
				const index = table.findIndex((record) => matchesWhereExact(record, where));
				const updated = { ...table[index], ...data };
				table[index] = updated;
				return { ...updated };
			},

			delete: ({ where }) => {
				const table = this._store[modelName];
				const index = table.findIndex((record) => matchesWhereExact(record, where));
				const [deleted] = table.splice(index, 1);
				return { ...deleted };
			},
		};
	}

	/**
	 * Attach one-level included relations to the output object.
	 *
	 * @param {string} modelName
	 * @param {Record<string, unknown>} sourceRecord
	 * @param {Record<string, unknown>} outRecord
	 * @param {Record<string, boolean>} include
	 * @returns {void}
	 */
	_attachIncludes(modelName, sourceRecord, outRecord, include) {
		const modelRelations = this._relations[modelName] || {};

		for (const [relationName, shouldInclude] of Object.entries(include)) {
			if (!shouldInclude) {
				continue;
			}

			const relationDef = modelRelations[relationName];
			if (!relationDef) {
				continue;
			}

			const relatedTable = this._store[relationDef.model] || [];
			const sourceValue = sourceRecord[relationDef.sourceKey];

			if (relationDef.type === 'one') {
				const related = relatedTable.find(
					(record) => record[relationDef.targetKey] === sourceValue,
				);

				outRecord[relationName] = related ? { ...related } : null;
			} else {
				outRecord[relationName] = relatedTable
					.filter((record) => record[relationDef.targetKey] === sourceValue)
					.map((record) => ({ ...record }));
			}
		}
	}
}

/**
 * Exact equality matcher used by update and delete.
 *
 * @param {Record<string, unknown>} record
 * @param {Record<string, unknown>} where
 * @returns {boolean}
 */
function matchesWhereExact(record, where) {
	for (const [key, value] of Object.entries(where)) {
		if (record[key] !== value) {
			return false;
		}
	}

	return true;
}

/**
 * Enhanced matcher used by findMany.
 *
 * Supported operators:
 * - in
 * - gt
 * - gte
 * - lt
 * - lte
 * - contains
 *
 * @param {Record<string, unknown>} record
 * @param {Record<string, unknown>} where
 * @returns {boolean}
 */
function matchesWhereEnhanced(record, where) {
	for (const [field, condition] of Object.entries(where)) {
		const fieldValue = record[field];

		if (!isOperatorObject(condition)) {
			if (fieldValue !== condition) {
				return false;
			}
			continue;
		}

		if (Object.prototype.hasOwnProperty.call(condition, 'in')) {
			if (!condition.in.includes(fieldValue)) {
				return false;
			}
		}

		if (Object.prototype.hasOwnProperty.call(condition, 'gt')) {
			if (!(fieldValue > condition.gt)) {
				return false;
			}
		}

		if (Object.prototype.hasOwnProperty.call(condition, 'gte')) {
			if (!(fieldValue >= condition.gte)) {
				return false;
			}
		}

		if (Object.prototype.hasOwnProperty.call(condition, 'lt')) {
			if (!(fieldValue < condition.lt)) {
				return false;
			}
		}

		if (Object.prototype.hasOwnProperty.call(condition, 'lte')) {
			if (!(fieldValue <= condition.lte)) {
				return false;
			}
		}

		if (Object.prototype.hasOwnProperty.call(condition, 'contains')) {
			if (typeof fieldValue !== 'string' || !fieldValue.includes(condition.contains)) {
				return false;
			}
		}
	}

	return true;
}

/**
 * @param {Record<string, unknown>} record
 * @param {Record<string, boolean>} select
 * @returns {Record<string, unknown>}
 */
function pickSelectedFields(record, select) {
	const out = {};

	for (const [field, enabled] of Object.entries(select)) {
		if (enabled) {
			out[field] = record[field];
		}
	}

	return out;
}

/**
 * @param {unknown} value
 * @returns {value is {
 *   in?: Array<unknown>,
 *   gt?: unknown,
 *   gte?: unknown,
 *   lt?: unknown,
 *   lte?: unknown,
 *   contains?: string,
 * }}
 */
function isOperatorObject(value) {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}

	const operatorKeys = new Set(['in', 'gt', 'gte', 'lt', 'lte', 'contains']);
	const keys = Object.keys(value);

	if (keys.length === 0) {
		return false;
	}

	return keys.some((key) => operatorKeys.has(key));
}

/**
Example:

const db = new MiniORM(
	{
		playlist: [
			{ id: 1, name: 'Road Trip' },
			{ id: 2, name: 'Focus' },
		],
		track: [
			{ id: 10, title: 'Intro', playlistId: 1 },
			{ id: 11, title: 'Highway', playlistId: 1 },
			{ id: 12, title: 'Deep Work', playlistId: 2 },
		],
	},
	{
		playlist: {
			tracks: {
				model: 'track',
				type: 'many',
				sourceKey: 'id',
				targetKey: 'playlistId',
			},
		},
		track: {
			playlist: {
				model: 'playlist',
				type: 'one',
				sourceKey: 'playlistId',
				targetKey: 'id',
			},
		},
	},
);

db.playlist.findMany({
	select: { id: true, name: true },
	include: { tracks: true },
});
*/
