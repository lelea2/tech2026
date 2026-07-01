function serialize(value) {
  const seen = new Map(); // object -> id
  const objects = {};
  let nextId = 1;

  function encode(current) {
    // Primitive values can be stored directly.
    if (
      current === null ||
      typeof current === "string" ||
      typeof current === "number" ||
      typeof current === "boolean"
    ) {
      return current;
    }

    if (typeof current !== "object") {
      throw new Error(`Unsupported type: ${typeof current}`);
    }

    // If we have already seen this object, return a reference.
    if (seen.has(current)) {
      return { $ref: seen.get(current) };
    }

    const id = nextId++;
    seen.set(current, id);

    // Reserve the object first.
    // This is important because the object may reference itself.
    objects[id] = {};

    for (const [key, childValue] of Object.entries(current)) {
      objects[id][key] = encode(childValue);
    }

    return { $ref: id };
  }

  return JSON.stringify({
    root: encode(value),
    objects,
  });
}

function deserialize(serialized) {
  const data = JSON.parse(serialized);
  const objects = data.objects || {};
  const created = new Map(); // id -> object

  function decode(current) {
    // Primitive values are returned directly.
    if (
      current === null ||
      typeof current === "string" ||
      typeof current === "number" ||
      typeof current === "boolean"
    ) {
      return current;
    }

    if (typeof current !== "object") {
      throw new Error(`Unsupported encoded value: ${current}`);
    }

    // Reference to an object.
    if ("$ref" in current) {
      const id = current.$ref;

      if (!objects[id]) {
        throw new Error(`Invalid reference id: ${id}`);
      }

      // Return already-created object if it exists.
      if (created.has(id)) {
        return created.get(id);
      }

      // Create placeholder first.
      // This allows circular references to be reconstructed.
      const result = {};
      created.set(id, result);

      for (const [key, encodedChildValue] of Object.entries(objects[id])) {
        result[key] = decode(encodedChildValue);
      }

      return result;
    }

    throw new Error("Invalid serialized object format");
  }

  return decode(data.root);
}