/**
 * Interview question: Chat Event Counter
 *
 * Design an in-memory counter that tracks chat events for each
 * `(userId, chatId)` pair. Only events from the most recent 15-minute
 * inclusive window should count.
 *
 * Each operation is either:
 * - ["processEvent", userId, chatId, timestamp]
 * - ["getCount", userId, chatId]
 *
 * Assumptions:
 * - Timestamps are measured in seconds.
 * - Timestamps are non-decreasing for each `(userId, chatId)` pair.
 * - `getCount` uses the window established by the latest event processed for
 *   that pair because the operation does not include its own timestamp.
 * - The valid window for an event at time T is [T - 900, T], inclusive.
 *
 * Example:
 * const operations = [
 *   ["processEvent", "user-1", "chat-1", 100],
 *   ["processEvent", "user-1", "chat-1", 500],
 *   ["getCount", "user-1", "chat-1"],
 *   ["processEvent", "user-1", "chat-1", 1100],
 *   ["getCount", "user-1", "chat-1"],
 *   ["getCount", "user-2", "chat-1"],
 * ];
 *
 * Output: [2, 2, 0]
 *
 * At timestamp 1100, the window starts at 200. The event at timestamp 100
 * expires, while the events at 500 and 1100 remain.
 *
 * Approach:
 * - Store one timestamp queue for every user/chat pair.
 * - Append each new timestamp to the end of its queue.
 * - Move a start pointer past expired timestamps instead of shifting the array.
 * - Occasionally compact the array to release discarded entries.
 *
 * Complexity:
 * - processEvent: amortized O(1). Each timestamp is appended and expired once.
 * - getCount: O(1).
 * - Space: O(p + w), where p is the number of tracked pairs and w is the
 *   number of retained timestamps across their active windows.
 *
 * @param {Array<Array<string | number>>} operations
 * @return {number[]}
 */
export default function chatEventCounter(operations) {
  const WINDOW_SECONDS = 900; // time window in seconds for each user/chat pair

  // Map each pair to its timestamp queue and the first non-expired position.
  const counters = new Map();

  const results = [];

  function getKey(userId, chatId) {
    // A null separator prevents ambiguous keys such as ("ab", "c") and ("a", "bc").
    return `${userId}\u0000${chatId}`;
  }

  function processEvent(userId, chatId, timestamp) {
    const key = getKey(userId, chatId);

    if (!counters.has(key)) {
      counters.set(key, {
        timestamps: [],
        start: 0,
      });
    }

    const counter = counters.get(key);

    counter.timestamps.push(timestamp);

    const windowStart = timestamp - WINDOW_SECONDS;

    // Advance the queue head past events outside the inclusive [T - 900, T] window.
    while (
      counter.start < counter.timestamps.length &&
      counter.timestamps[counter.start] < windowStart
    ) {
      counter.start++;
    }

    // Compact occasionally so expired entries do not remain in memory forever.
    if (counter.start > 1024 && counter.start * 2 > counter.timestamps.length) {
      counter.timestamps = counter.timestamps.slice(counter.start);
      counter.start = 0;
    }
  }

  function getCount(userId, chatId) {
    const key = getKey(userId, chatId);

    if (!counters.has(key)) {
      return 0;
    }

    const counter = counters.get(key);
    return counter.timestamps.length - counter.start;
  }

  for (const operation of operations) {
    const [type, userId, chatId, timestamp] = operation;

    if (type === "processEvent") {
      processEvent(userId, chatId, timestamp);
    } else if (type === "getCount") {
      results.push(getCount(userId, chatId));
    }
  }

  return results;
}

/**
 * Test case 1: count events in the same pair
 *
 * Input:
 * [
 *   ["processEvent", "user-1", "chat-1", 100],
 *   ["processEvent", "user-1", "chat-1", 500],
 *   ["getCount", "user-1", "chat-1"],
 * ]
 *
 * Output: [2]
 */

/**
 * Test case 2: expire events outside the 15-minute window
 *
 * Input:
 * [
 *   ["processEvent", "user-1", "chat-1", 100],
 *   ["processEvent", "user-1", "chat-1", 500],
 *   ["processEvent", "user-1", "chat-1", 1100],
 *   ["getCount", "user-1", "chat-1"],
 * ]
 *
 * At timestamp 1100, the window is [200, 1100]. Timestamp 100 expires.
 *
 * Output: [2]
 */

/**
 * Test case 3: include the exact 900-second boundary
 *
 * Input:
 * [
 *   ["processEvent", "user-1", "chat-1", 100],
 *   ["processEvent", "user-1", "chat-1", 1000],
 *   ["getCount", "user-1", "chat-1"],
 * ]
 *
 * At timestamp 1000, the window starts at 100, so both events count.
 *
 * Output: [2]
 */

/**
 * Test case 4: track pairs independently
 *
 * Input:
 * [
 *   ["processEvent", "user-1", "chat-1", 100],
 *   ["processEvent", "user-1", "chat-2", 200],
 *   ["processEvent", "user-2", "chat-1", 300],
 *   ["processEvent", "user-1", "chat-1", 400],
 *   ["getCount", "user-1", "chat-1"],
 *   ["getCount", "user-1", "chat-2"],
 *   ["getCount", "user-2", "chat-1"],
 * ]
 *
 * Output: [2, 1, 1]
 */

/**
 * Test case 5: unknown pair
 *
 * Input:
 * [["getCount", "missing-user", "missing-chat"]]
 *
 * Output: [0]
 */
