class FileSystem {
  constructor(maxEntriesPerDirectory = 5) {
    this.maxEntries = maxEntriesPerDirectory;

    // Every node is either:
    // { type: "directory", children: Map<string, Node> }
    // { type: "file", content: string }
    this.root = this.createDirectory();
  }

  /**
   * Adds a file and creates missing intermediate directories.
   *
   * Returns the actual path used after duplicate-name resolution.
   *
   * Example:
   * addFile("docs/file.txt", "hello") => "docs/file.txt"
   * addFile("docs/file.txt", "world") => "docs/file(1).txt"
   */
  addFile(path, content = "") {
    const parts = this.parsePath(path);

    if (parts.length === 0) {
      throw new Error("File path cannot be empty");
    }

    const directoryParts = parts.slice(0, -1);
    const requestedFileName = parts.at(-1);

    // Preflight the operation first so a failed insertion does not leave
    // partially created directories behind.
    const plan = this.createInsertionPlan(
      directoryParts,
      requestedFileName
    );

    // Apply the validated directory-creation plan.
    let current = this.root;

    for (const directoryName of directoryParts) {
      if (!current.children.has(directoryName)) {
        current.children.set(directoryName, this.createDirectory());
      }

      current = current.children.get(directoryName);
    }

    current.children.set(plan.finalFileName, {
      type: "file",
      content,
    });

    return [...directoryParts, plan.finalFileName].join("/");
  }

  /**
   * Returns:
   * - file content when the path points to a file
   * - immediate child names when the path points to a directory
   */
  getFile(path) {
    const parts = this.parsePath(path);
    let current = this.root;

    for (const part of parts) {
      if (current.type !== "directory") {
        throw new Error(`"${part}" cannot be accessed beneath a file`);
      }

      const child = current.children.get(part);

      if (!child) {
        return null;
      }

      current = child;
    }

    if (current.type === "file") {
      return current.content;
    }

    // Return a simple folder representation rather than exposing
    // the internal mutable Map.
    return Array.from(current.children.keys());
  }

  createInsertionPlan(directoryParts, requestedFileName) {
    let current = this.root;

    // Check every intermediate directory before mutating anything.
    for (const directoryName of directoryParts) {
      const child = current.children.get(directoryName);

      if (child) {
        if (child.type !== "directory") {
          throw new Error(
            `Cannot create directory "${directoryName}": a file already exists`
          );
        }

        current = child;
        continue;
      }

      this.assertHasCapacity(current);

      // This directory does not exist yet. Conceptually descend into a new,
      // empty directory while continuing preflight validation.
      current = this.createDirectory();
    }

    const finalFileName = this.findAvailableFileName(
      current,
      requestedFileName
    );

    this.assertHasCapacity(current);

    return { finalFileName };
  }

  findAvailableFileName(directory, requestedName) {
    if (!directory.children.has(requestedName)) {
      return requestedName;
    }

    const { stem, extension } = this.splitFileName(requestedName);
    let counter = 1;

    while (true) {
      const candidate = `${stem}(${counter})${extension}`;

      if (!directory.children.has(candidate)) {
        return candidate;
      }

      counter++;
    }
  }

  splitFileName(fileName) {
    const lastDot = fileName.lastIndexOf(".");

    // Treat ".env" as a stem without an extension.
    if (lastDot <= 0) {
      return {
        stem: fileName,
        extension: "",
      };
    }

    return {
      stem: fileName.slice(0, lastDot),
      extension: fileName.slice(lastDot),
    };
  }

  assertHasCapacity(directory) {
    if (directory.children.size >= this.maxEntries) {
      throw new Error(
        `Directory capacity exceeded: maximum ${this.maxEntries} entries`
      );
    }
  }

  parsePath(path) { // array of folder and file
    if (typeof path !== "string") {
      throw new TypeError("Path must be a string");
    }

    return path
      .split("/")
      .filter(Boolean);
  }

  createDirectory() {
    return {
      type: "directory",
      children: new Map(),
    };
  }
}