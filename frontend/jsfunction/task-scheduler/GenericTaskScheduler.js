class GenericTaskScheduler {
  constructor(getKeyId) {
    if (typeof getKeyId !== "function") {
      throw new TypeError("getKeyId must be a function");
    }

    this.getKeyId = getKeyId;
    this.tasks = new Map();
  }

  schedule(key, task, delayMs) {
    const id = this.getKeyId(key);

    if (this.tasks.has(id)) {
      this.cancel(key);
    }

    const timerId = setTimeout(async () => {
      this.tasks.delete(id);

      try {
        await task();
      } catch (error) {
        console.error("Scheduled task failed:", error);
      }
    }, delayMs);

    this.tasks.set(id, {
      key,
      task,
      timerId,
    });
  }

  cancel(key) {
    const id = this.getKeyId(key);
    const entry = this.tasks.get(id);

    if (!entry) {
      return false;
    }

    clearTimeout(entry.timerId);
    this.tasks.delete(id);
    return true;
  }

  has(key) {
    return this.tasks.has(this.getKeyId(key));
  }

  clear() {
    for (const entry of this.tasks.values()) {
      clearTimeout(entry.timerId);
    }

    this.tasks.clear();
  }
}

// Usage
const scheduler = new GenericTaskScheduler(
  key => `${key.namespace}:${key.id}`
);

scheduler.schedule(
  new TaskKey("report", 10),
  () => console.log("Generate report"),
  500
);

console.log(
  scheduler.has(new TaskKey("report", 10))
); // true

scheduler.cancel(new TaskKey("report", 10));
console.log(
  scheduler.has(new TaskKey("report", 10))
); // false