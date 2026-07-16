// Create a promise class from scratch
class SimplePromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.handlers = []; // handlers are object {onFulfilled, onRejected, resolve, reject}

    const resolve = value => {
      if (this.state !== 'pending') return;

      this.state = 'fulfilled';
      this.value = value;
      this.flush();
    };

    const reject = error => {
      if (this.state !== 'pending') return;

      this.state = 'rejected';
      this.value = error;
      this.flush();
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  flush() {
    if (this.state === 'pending') return;

    queueMicrotask(() => {
      const handlers = this.handlers;
      this.handlers = [];

      for (const handler of handlers) {
        const callback =
          this.state === 'fulfilled'
            ? handler.onFulfilled
            : handler.onRejected;

        if (!callback) {
          if (this.state === 'fulfilled') {
            handler.resolve(this.value);
          } else {
            handler.reject(this.value);
          }
          continue;
        }

        try {
          const result = callback(this.value);
          handler.resolve(result);
        } catch (error) {
          handler.reject(error);
        }
      }
    });
  }

  then(onFulfilled, onRejected) {
    return new SimplePromise((resolve, reject) => {
      this.handlers.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      });

      this.flush();
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
}