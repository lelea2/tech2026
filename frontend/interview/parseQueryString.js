function parseQueryString(query) {
  const result = new Map();

  const input = query.startsWith("?") ? query.slice(1) : query;
  if (!input) return result;

  for (const part of input.split("&")) {
    if (!part) continue;

    let key;
    let value;

    // Example: !isBooleanField means isBooleanField=true
    if (part.startsWith("!")) {
      key = decodeURIComponent(part.slice(1));
      value = true;
    } else {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex === -1) {
        key = decodeURIComponent(part);
        value = true;
      } else {
        key = decodeURIComponent(part.slice(0, separatorIndex));

        const rawValue = decodeURIComponent(
          part.slice(separatorIndex + 1)
        );

        value = parseValue(rawValue);
      }
    }

    addValue(result, key, value);
  }

  return result;
}

function parseValue(value) {
  // Remove matching quotation marks.
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if (value === "true") return true;
  if (value === "false") return false;

  // Avoid converting values such as "001" into 1.
  if (/^-?(0|[1-9]\d*)$/.test(value)) {
    return Number(value);
  }

  return value;
}

function addValue(result, key, value) {
  if (!result.has(key)) {
    result.set(key, value);
    return;
  }

  const existing = result.get(key);

  if (Array.isArray(existing)) {
    existing.push(value);
  } else {
    result.set(key, [existing, value]);
  }
}