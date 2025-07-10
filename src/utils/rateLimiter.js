// This file implements a rate limiter utility to control the number of requests
// sent to email providers within a specified time interval.
// It helps prevent overwhelming the providers and ensures compliance with their rate limits.

class RateLimiter {
  constructor(maxRequests, intervalMs) {
    this.maxRequests = maxRequests;
    this.intervalMs = intervalMs;
    this.timestamps = [];
  }

  isAllowed() {
    // Check if the current request is allowed based on the rate limit
    const now = Date.now();

    // Remove timestamps outside the interval
    this.timestamps = this.timestamps.filter(
      (ts) => now - ts < this.intervalMs
    );
    // If the number of requests in the current interval is less than the max allowed, allow the request
    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return true;
    }
    // Otherwise, deny the request
    return false;
  }
}

module.exports = RateLimiter;
