// A throttle is a common technique used in the browser to improve an application’s performance by limiting the number of events your code needs to handle.
// You should use a throttle when you want to execute a callback at a controlled rate,
// allowing you to handle intermediate states repeatedly at each fixed interval of time.

export default function throttle(
  func,
  wait,
) {
  let throttleTimeout = null;
  let storeThis = null;
  let storeArgs = null;
  
  function throttleHandler(...args) {
    storeArgs = args;
    storeThis = this;

    const shouldHandleEvent = !throttleTimeout;

    if (shouldHandleEvent) {
      func.apply(storeThis, storeArgs);

      // reset
      storeArgs = null;
      storeThis = null;

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        if (storeArgs) {
          throttleHandler.apply(storeThis, storeArgs);
        }
      }, wait);
    }
  }
  return throttleHandler;
}


/*
```
import throttle from './throttle';

describe('throttle', () => {
  test('can be initialized', () => {
    const increment = throttle(() => {}, 50);
    expect(increment).toBeInstanceOf(Function);
  });

  test('invokes callback immediately', () => {
    let i = 0;
    const increment = throttle(() => {
      i++;
    }, 50);

    expect(i).toBe(0);
    increment();
    expect(i).toBe(1);
  });

  test('throttles immediate invocations', () => {
    let i = 0;
    const increment = throttle(() => {
      i++;
    }, 50);

    expect(i).toBe(0);
    increment();
    expect(i).toBe(1);
    increment();
    expect(i).toBe(1);
  });

  test('throttles delayed invocations', (done) => {
    let i = 0;
    const increment = throttle(() => {
      i++;
    }, 100);

    expect(i).toBe(0);
    increment();
    expect(i).toBe(1);

    setTimeout(() => {
      increment();
      expect(i).toBe(1);
    }, 25);

    setTimeout(() => {
      increment();
      expect(i).toBe(1);
      done();
    }, 50);
  });

  test('uses arguments', () => {
    let i = 21;
    const increment = throttle((a, b) => {
      i += a * b;
    }, 50);

    expect(i).toBe(21);
    increment(3, 7);
    expect(i).toBe(42);
  });

  test('can be called again after first throttling window', (done) => {
    let i = 0;
    const increment = throttle(() => {
      i++;
    }, 100);

    expect(i).toBe(0);
    increment();
    expect(i).toBe(1);

    // Should not fire yet.
    setTimeout(() => {
      expect(i).toBe(1);
      increment();
      expect(i).toBe(1);
    }, 50);

    setTimeout(() => {
      expect(i).toBe(1);
      increment();
      expect(i).toBe(2);
    }, 150);

    setTimeout(() => {
      expect(i).toBe(2);
      increment();
      expect(i).toBe(2);
      done();
    }, 200);
  });

  test('callbacks can access `this`', (done) => {
    const increment = throttle(function (delta) {
      this.val += delta;
    }, 50);

    const obj = {
      val: 2,
      increment,
    };

    expect(obj.val).toBe(2);
    obj.increment(3);
    expect(obj.val).toBe(5);

    setTimeout(() => {
      obj.increment(10);
      expect(obj.val).toBe(15);
      done();
    }, 100);
  });
});
```
*/