// report_data: O(1)
// percentile: O(number of buckets)
// memory: O(number of metrics * number of buckets)
// Because values are integer, [0. limit] ==> we can bucket value and estimate percentiles from bucket count
// instead of storing every raw value
class Percentiles {
  constructor(limit) {
    if (!Number.isInteger(limit) || limit < 0) {
      throw new Error("limit must be a non-negative integer");
    }

    this.limit = limit;

    // Fixed memory approximation.
    // More buckets = better accuracy but more memory.
    this.bucketCount = Math.min(limit + 1, 1000);

    this.bucketSize = (limit + 1) / this.bucketCount;

    // metric -> {
    //   buckets: number[],
    //   count: number,
    //   min: number,
    //   max: number
    // }
    this.metrics = new Map();
  }

  report_data(metric, value) {
    if (!Number.isInteger(value) || value < 0 || value > this.limit) {
      throw new Error(`value must be an integer in [0, ${this.limit}]`);
    }

    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, {
        buckets: Array(this.bucketCount).fill(0),
        count: 0,
        min: Infinity,
        max: -Infinity,
      });
    }

    const data = this.metrics.get(metric);

    const bucketIndex = Math.min(
      this.bucketCount - 1,
      Math.floor(value / this.bucketSize)
    );

    data.buckets[bucketIndex]++;
    data.count++;
    data.min = Math.min(data.min, value);
    data.max = Math.max(data.max, value);
  }

  
  percentile(p, metric) {
    if (p < 0 || p > 100) {
      throw new Error("percentile p must be in [0, 100]");
    }

    if (!this.metrics.has(metric)) {
      throw new Error(`metric '${metric}' has no data`);
    }

    const data = this.metrics.get(metric);

    // Exact answers for boundaries.
    if (p === 0) return data.min;
    if (p === 100) return data.max;

    const targetRank = Math.ceil((p / 100) * data.count);

    let seen = 0;

    for (let i = 0; i < this.bucketCount; i++) {
      seen += data.buckets[i];

      if (seen >= targetRank) {
        const bucketStart = i * this.bucketSize;
        const bucketEnd = Math.min(this.limit, (i + 1) * this.bucketSize - 1);

        // Return midpoint of the bucket as approximation.
        return (bucketStart + bucketEnd) / 2;
      }
    }

    return data.max;
  }
}