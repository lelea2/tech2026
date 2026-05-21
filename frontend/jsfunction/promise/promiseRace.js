// The Promise.race() method returns a promise that fulfills or rejects as soon as one of the promises in an iterable fulfills or rejects, 
// with the value or reason from that promise.

/**
 * @param {Array} iterable
 * @return {Promise}
 */
export default function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    let settled = false;
    for (const promise of iterable) {
      Promise.resolve(promise)
        .then((value) => {
          if (settled) {
            return;
          }
          settled = true;
          resolve(value);
        }, (error) => {
          if (settled) {
            return;
          }
          settled = true;
          reject(error);
        });
    }
  });
}

/**
 * mport promiseRace from './promise-race';

describe('promiseRace', () => {
  test('returns a promise', () => {
    const promise = promiseRace([]);
    expect(promise).toBeInstanceOf(Promise);
  });

  test('empty input array', (done) => {
    expect.assertions(1);
    const promise = promiseRace([]);
    expect(promise).toBeInstanceOf(Promise);
    promise.then(
      (value) => {
        expect(value).toBeTruthy();
      },
      (reason) => {
        expect(reason).toBeTruthy();
      },
    );

    setTimeout(() => {
      done();
    }, 10);
  });

  describe('one promise', () => {
    describe('resolve', () => {
      test('value', async () => {
        expect.assertions(1);
        const p0 = 2;

        const res = await promiseRace([p0]);
        expect(res).toEqual(2);
      });

      test('instant', async () => {
        expect.assertions(1);
        const p0 = Promise.resolve(2);

        const res = await promiseRace([p0]);
        expect(res).toEqual(2);
      });

      test('delayed', async () => {
        expect.assertions(1);
        const p0 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(2);
          }, 10);
        });

        const res = await promiseRace([p0]);
        expect(res).toEqual(2);
      });
    });

    describe('reject', () => {
      test('instant', async () => {
        expect.assertions(1);
        const p0 = Promise.reject(2);

        await expect(promiseRace([p0])).rejects.toBe(2);
      });

      test('delayed', async () => {
        expect.assertions(1);
        const p0 = new Promise((_, reject) => {
          setTimeout(() => {
            reject(2);
          }, 10);
        });

        await expect(promiseRace([p0])).rejects.toBe(2);
      });
    });
  });

  describe('multiple promises', () => {
    describe('all resolve', () => {
      test('instant', async () => {
        expect.assertions(1);
        const p0 = Promise.resolve(2);
        const p1 = Promise.resolve(3);

        const res = await promiseRace([p0, p1]);
        expect(res).toEqual(2);
      });

      test('delayed', async () => {
        expect.assertions(1);
        const p0 = Promise.resolve(2);
        const p1 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(3);
          }, 10);
        });

        const res = await promiseRace([p0, p1]);
        expect(res).toEqual(2);
      });

      test('mixture', async () => {
        expect.assertions(1);
        const p0 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(2);
          }, 10);
        });
        const p1 = Promise.resolve(3);
        const p2 = 4;

        const res = await promiseRace([p0, p1, p2]);
        expect(res).toEqual(3);
      });

      test('many delayed', async () => {
        expect.assertions(1);
        const p0 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(1);
          }, 200);
        });
        const p1 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(2);
          }, 100);
        });
        const p2 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(3);
          }, 10);
        });

        const res = await promiseRace([p0, p1, p2]);
        expect(res).toEqual(3);
      });
    });

    describe('all reject', () => {
      test('instant', async () => {
        expect.assertions(1);
        const p0 = Promise.reject(2);
        const p1 = Promise.reject(3);

        await expect(promiseRace([p0, p1])).rejects.toBe(2);
      });

      test('delayed', async () => {
        expect.assertions(1);
        const p0 = new Promise((_, reject) => {
          setTimeout(() => {
            reject(3);
          }, 1);
        });
        const p1 = new Promise((_, reject) => {
          setTimeout(() => {
            reject(2);
          }, 10);
        });

        await expect(promiseRace([p0, p1])).rejects.toBe(3);
      });

      test('mixture', async () => {
        expect.assertions(1);
        const p0 = Promise.reject(42);
        const p1 = new Promise((_, reject) => {
          setTimeout(() => {
            reject(2);
          }, 10);
        });

        await expect(promiseRace([p0, p1])).rejects.toBe(42);
      });
    });

    describe('mix of resolve and reject', () => {
      test('instant resolve delayed reject', async () => {
        expect.assertions(1);
        const p0 = Promise.resolve(42);
        const p1 = new Promise((_, reject) => {
          setTimeout(() => {
            reject(2);
          }, 10);
        });

        const res = await promiseRace([p0, p1]);
        expect(res).toEqual(42);
      });

      test('instant resolve instant reject', async () => {
        expect.assertions(1);
        const p0 = Promise.resolve(42);
        const p1 = Promise.reject(2);

        const res = await promiseRace([p0, p1]);
        expect(res).toEqual(42);
      });

      test('instant reject instant resolve', async () => {
        expect.assertions(1);
        const p0 = Promise.reject(42);
        const p1 = Promise.resolve(2);

        await expect(promiseRace([p0, p1])).rejects.toBe(42);
      });

      test('instant rejects', async () => {
        expect.assertions(1);
        const p0 = Promise.reject(42);
        const p1 = Promise.reject(43);

        await expect(promiseRace([p0, p1])).rejects.toBe(42);
      });

      test('delayed resolve', async () => {
        expect.assertions(1);
        const p0 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(1);
          }, 10);
        });
        const p1 = new Promise((_, reject) => {
          setTimeout(() => {
            reject(2);
          }, 100);
        });
        const p2 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(3);
          }, 200);
        });

        await expect(promiseRace([p0, p1, p2])).resolves.toBe(1);
      });

      test('delayed reject', async () => {
        expect.assertions(1);
        const p0 = new Promise((_, reject) => {
          setTimeout(() => {
            reject(1);
          }, 200);
        });
        const p1 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(2);
          }, 100);
        });
        const p2 = new Promise((_, reject) => {
          setTimeout(() => {
            reject(3);
          }, 10);
        });

        await expect(promiseRace([p0, p1, p2])).rejects.toBe(3);
      });

      test('delayed throw', async () => {
        expect.assertions(1);
        const p0 = new Promise(() => {
          throw 42;
        });
        const p1 = new Promise((resolve) => {
          setTimeout(() => {
            resolve(2);
          }, 100);
        });

        await expect(promiseRace([p0, p1])).rejects.toBe(42);
      });
    });
  });
});
 */