/**
 * Simple Mustache-like template renderer.
 *
 * Idea:
 * - Find {{ key }} placeholders with regex
 * - Trim whitespace inside the tag
 * - Look up key in data
 * - null / undefined / missing => ''
 * - false / 0 / '' should still render
 *
 * @param {string} template
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
export default function renderTemplate(template, data) {
  return template.replace(/{{\s*([^}]+?)\s*}}/g, (_, key) => {
    const value = data[key.trim()];

    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  });
}