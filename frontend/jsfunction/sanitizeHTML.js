/**
 * @param {string} input
 * @return {string}
 */
export default function sanitizeHTML(input) {
  const template = document.createElement('template');
  template.innerHTML = input;

  const forbiddenTags = new Set([
    'script',
    'iframe',
    'object',
    'embed',
  ]);

  function walk(node) {
    // Remove comments
    if (node.nodeType === Node.COMMENT_NODE) {
      node.remove();
      return;
    }

    // Process element nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      // Remove forbidden tags
      if (forbiddenTags.has(tagName)) {
        node.remove();
        return;
      }

      // Remove dangerous attributes
      for (const attr of [...node.attributes]) {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();
        // Remove event handlers
        if (name.startsWith('on')) {
          node.removeAttribute(attr.name);
          continue;
        }
        // Remove javascript: URLs
        if (
          ['href', 'src', 'xlink:href'].includes(name) &&
          value.startsWith('javascript:')
        ) {
          node.removeAttribute(attr.name);
        }
      }

    }

    // Walk children
    [...node.childNodes].forEach(walk);
  }
  [...template.content.childNodes].forEach(walk);

  return template.innerHTML
    // only collapse whitespace between tags
    .replace(/>\s+</g, '><')
    .trim();

  // this will remove white space
  // return template.innerHTML
  //   .replace(/\n/g, '')
  //   .replace(/\s+</g, '<')
  //   .replace(/>\s+/g, '>')
  //   .trim();
}


/* =========================
   Test Cases
========================= */
/*
console.log(
  sanitizeHTML('<p>Hello <strong>world</strong></p>')
);

// '<p>Hello <strong>world</strong></p>'

console.log(
  sanitizeHTML(`
    <div>
      <!-- secret -->
      <a href=" javascript:alert(1) " onclick="evil()">Click me</a>
      <script>alert(1)</script>
    </div>
  `)

);
// '<div><a>Click me</a></div>'
*/