// This file implements an idempotency store to prevent duplicate processing of requests.
// It uses a Set to store unique keys, allowing for efficient checks and additions.
class IdempotencyStore {
  constructor() {
    this.keys = new Set();
  }

  // This method checks if a key exists in the store
  // It returns true if the key is present, false otherwise
  has(key) {
    return this.keys.has(key);
  }

  // This method adds a key to the store
  add(key) {
    this.keys.add(key);
  }
}

module.exports = IdempotencyStore;
