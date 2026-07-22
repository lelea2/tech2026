// Trie-like tree
class FileNode {
  constructor() {
    this.value = undefined;
    this.children = new Map();
  }
}

class FileSystem {
  constructor() {
    this.root = new FileNode();
  }

  create(path, value = undefined) {
    const parts = this.parsePath(path);
    let current = this.root;
    for (const part of parts) {
      if (!current.children.has(part)) {
        current.children.set(part, new FileNode());
      }
      current = current.children.get(part);
    }
    current.value = value;
    return true;
  }

  get(path) {
    const node = this.findNode(path);
    return node?.value;
  }

  set(path, value) {
    const node = this.findNode(path);
    if (!node) {
      return false;
    }
    node.value = value;
    return true;
  }

  exists(path) {
    return this.findNode(path) !== null;
  }

  list(path = "") {
    const node = path ? this.findNode(path) : this.root;
    if (!node) {
      return [];
    }
    return [...node.children.keys()];
  }

  delete(path) {
    const parts = this.parsePath(path);
    if (parts.length === 0) {
      return false;
    }
    const name = parts.pop();
    let parent = this.root;
    for (const part of parts) {
      parent = parent.children.get(part);
      if (!parent) {
        return false;
      }
    }
    return parent.children.delete(name);
  }

  findNode(path) {
    const parts = this.parsePath(path);
    let current = this.root;
    for (const part of parts) {
      current = current.children.get(part);
      if (!current) {
        return null;
      }
    }

    return current;
  }

  parsePath(path) {
    if (typeof path !== "string") {
      throw new TypeError("Path must be a string");
    }

    return path.split("/").filter(Boolean);
  }
}