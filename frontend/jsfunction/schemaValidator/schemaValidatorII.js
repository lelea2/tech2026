/**
 * @typedef {string | number} PathSegment
 *
 * @typedef {{
 *   path: PathSegment[],
 *   message: string,
 * }} ValidationError
 *
 * @typedef {{
 *   success: true,
 *   data: unknown,
 * } | {
 *   success: false,
 *   errors: ValidationError[],
 * }} ParseResult
 *
 * @typedef {{
 *   safeParse(value: unknown): ParseResult,
 * }} Schema
 *
 * @typedef {Schema & {
 *   min(length: number): StringSchema,
 *   max(length: number): StringSchema,
 * }} StringSchema
 *
 * @typedef {Schema & {
 *   min(value: number): NumberSchema,
 *   max(value: number): NumberSchema,
 * }} NumberSchema
 *
 * @typedef {{
 *   string(): StringSchema,
 *   number(): NumberSchema,
 *   boolean(): Schema,
 *   object(shape: Record<string, Schema>): Schema,
 * }} SchemaFactory
 */

/** @type {SchemaFactory} */
/**
 * Mini schema validator with immutable, chainable rules.
 *
 * Data structure:
 * - Schema object with safeParse()
 * - Primitive schemas keep an ordered rules array
 *
 * Core idea:
 * - Type check first
 * - Then run rules in the order they were chained
 * - .min() / .max() return a NEW schema instead of mutating old one
 */

function createStringSchema(rules = []) {
  return {
    min(length) {
      return createStringSchema([
        ...rules,
        {
          check: (value) => value.length >= length,
          message: `Expected at least ${length} characters`,
        },
      ]);
    },

    max(length) {
      return createStringSchema([
        ...rules,
        {
          check: (value) => value.length <= length,
          message: `Expected at most ${length} characters`,
        },
      ]);
    },

    safeParse(value) {
      if (typeof value !== 'string') {
        return {
          success: false,
          errors: [{ path: [], message: 'Expected string' }],
        };
      }

      const errors = [];

      for (const rule of rules) {
        if (!rule.check(value)) {
          errors.push({
            path: [],
            message: rule.message,
          });
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors,
        };
      }

      return {
        success: true,
        data: value,
      };
    },
  };
}

function createNumberSchema(rules = []) {
  return {
    min(minValue) {
      return createNumberSchema([
        ...rules,
        {
          check: (value) => value >= minValue,
          message: `Expected number >= ${minValue}`,
        },
      ]);
    },

    max(maxValue) {
      return createNumberSchema([
        ...rules,
        {
          check: (value) => value <= maxValue,
          message: `Expected number <= ${maxValue}`,
        },
      ]);
    },

    safeParse(value) {
      if (typeof value !== 'number') {
        return {
          success: false,
          errors: [{ path: [], message: 'Expected number' }],
        };
      }

      const errors= [];
      for (const rule of rules) {
        if (!rule.check(value)) {
          errors.push({
            path: [],
            message: rule.message,
          });
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors
        };
      }
      return {
        success: true,
        data: value,
      };
    },
  };
}

function createBooleanSchema() {
  return {
    safeParse(value) {
      if (typeof value !== 'boolean') {
        return {
          success: false,
          errors: [{ path: [], message: 'Expected boolean' }],
        };
      }

      return { success: true, data: value };
    },
  };
}

const v = {
  string() {
    return createStringSchema();
  },

  number() {
    return createNumberSchema();
  },

  boolean() {
    return createBooleanSchema();
  },

  object(shape) {
    return {
      safeParse(value) {
        if (
          value === null ||
          typeof value !== 'object' ||
          Array.isArray(value)
        ) {
          return {
            success: false,
            errors: [{ path: [], message: 'Expected object' }],
          };
        }

        const errors = [];

        for (const key of Object.keys(shape)) {
          if (value[key] === undefined) {
            errors.push({
              path: [key],
              message: 'Required',
            });
            continue;
          }

          const result = shape[key].safeParse(value[key]);

          if (!result.success) {
            errors.push({
              path: [key],
              message: result.errors[0].message,
            });
          }
        }

        if (errors.length > 0) {
          return { success: false, errors };
        }

        return {
          success: true,
          data: { ...value },
        };
      },
    };
  },
};

export default v;


/**
const Name = v.string().min(2).max(5);

Name.safeParse('Ada');
// { success: true, data: 'Ada' }

Name.safeParse('');
// {
//   success: false,
//   errors: [{ path: [], message: 'Expected at least 2 characters' }],
// }

 */