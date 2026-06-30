/**
 * Backend API is assumed to exist.
 *
 * Example:
 * requestKeys(["abc", "efd"], (err, result) => {
 *   // result: { abc: 12, efd: 16 }
 * });
 */
function requestKeys(keys, callback) {
  // This is provided by the platform / backend.
  // Example:
  // fetch(`/api?keys=${keys.join(",")}`)
  //   .then(res => res.json())
  //   .then(data => callback(null, data))
  //   .catch(err => callback(err));
}

/**
 * Creates a batched getKey function.
 *
 * All getKey calls within `intervalMs` are combined into one HTTP request.
 */
function createBatchedGetKey(intervalMs = 1000) {
  let timer = null;

  // key -> list of callbacks waiting for that key
  let pendingCallbacks = {};

  function flush() {
    const callbacksForBatch = pendingCallbacks;
    const keys = Object.keys(callbacksForBatch);

    // Important reset:
    // Reset BEFORE the HTTP request returns, so new calls can form a new batch.
    pendingCallbacks = {};
    timer = null;

    if (keys.length === 0) return;

    requestKeys(keys, (err, result) => {
      for (const key of keys) {
        const callbacks = callbacksForBatch[key];

        for (const cb of callbacks) {
          if (err) {
            cb(err);
          } else {
            cb(null, result[key]);
          }
        }
      }
    });
  }

  return function getKey(key, callback) {
    if (!pendingCallbacks[key]) {
      pendingCallbacks[key] = [];
    }

    pendingCallbacks[key].push(callback);

    // Start one timer for the current batch.
    if (timer === null) {
      timer = setTimeout(flush, intervalMs);
    }
  };
}

const getKey = createBatchedGetKey(1000);

/**
 * -----------------------
 * Test cases (interview)
 * -----------------------
 * How to check:
 * 1) Run: node frontend/interview/batchRequest.js
 * 2) Look for lines starting with PASS.
 * 3) If any assertion fails, the script prints FAIL with the reason.
 */

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testSingleBatchAndDedup() {
  const batchedCalls = [];

  // Stub backend: record each request and return key length as value.
  requestKeys = (keys, callback) => {
    batchedCalls.push([...keys]);
    const result = {};
    for (const key of keys) {
      result[key] = key.length;
    }
    setTimeout(() => callback(null, result), 5);
  };

  const getKeyTest = createBatchedGetKey(20);
  const outputs = [];

  getKeyTest('abc', (err, value) => outputs.push({err, value, from: 'cb1'}));
  getKeyTest('xyz', (err, value) => outputs.push({err, value, from: 'cb2'}));
  getKeyTest('abc', (err, value) => outputs.push({err, value, from: 'cb3'}));

  await wait(60);

  assert(batchedCalls.length === 1, 'Expected exactly 1 batched backend request');
  assert(
    JSON.stringify(batchedCalls[0].sort()) === JSON.stringify(['abc', 'xyz'].sort()),
    'Expected deduped keys in one batch: [abc, xyz]'
  );
  assert(outputs.length === 3, 'Expected all 3 callbacks to be invoked');
  assert(outputs.every((item) => item.err === null), 'Expected no callback errors');
  assert(
    outputs.filter((item) => item.value === 3).length === 3,
    'Expected each callback to receive the mapped value'
  );

  console.log('PASS: single batch + key dedupe + fan-out callbacks');
}

async function testSeparateBatchesAcrossWindows() {
  const batchedCalls = [];

  requestKeys = (keys, callback) => {
    batchedCalls.push([...keys]);
    const result = Object.fromEntries(keys.map((k) => [k, k.toUpperCase()]));
    setTimeout(() => callback(null, result), 5);
  };

  const getKeyTest = createBatchedGetKey(20);
  const outputs = [];

  getKeyTest('a', (err, value) => outputs.push({err, value}));
  await wait(40); // cross interval window => next call must form a new batch
  getKeyTest('b', (err, value) => outputs.push({err, value}));

  await wait(60);

  assert(batchedCalls.length === 2, 'Expected 2 backend requests in 2 time windows');
  assert(batchedCalls[0].length === 1 && batchedCalls[0][0] === 'a', 'Batch #1 should only contain a');
  assert(batchedCalls[1].length === 1 && batchedCalls[1][0] === 'b', 'Batch #2 should only contain b');
  assert(outputs.length === 2, 'Expected both callbacks to complete');
  assert(outputs[0].value === 'A' && outputs[1].value === 'B', 'Expected mapped values from each batch');

  console.log('PASS: separate interval windows create separate batches');
}

async function testErrorFanOut() {
  requestKeys = (_keys, callback) => {
    setTimeout(() => callback(new Error('backend failed')), 5);
  };

  const getKeyTest = createBatchedGetKey(20);
  const outputs = [];

  getKeyTest('k1', (err, value) => outputs.push({err, value}));
  getKeyTest('k2', (err, value) => outputs.push({err, value}));

  await wait(60);

  assert(outputs.length === 2, 'Expected both callbacks to be called on error');
  assert(outputs.every((item) => item.err instanceof Error), 'Expected error to fan out to all callbacks');
  assert(outputs.every((item) => item.value === undefined), 'Expected no value when backend fails');

  console.log('PASS: backend error is fanned out to all callbacks in the batch');
}

async function runBatchRequestTests() {
  try {
    await testSingleBatchAndDedup();
    await testSeparateBatchesAcrossWindows();
    await testErrorFanOut();
    console.log('All batchRequest tests passed.');
  } catch (error) {
    console.error('FAIL:', error.message);
  }
}

runBatchRequestTests();