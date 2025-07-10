class EmailQueue {
  constructor(processFn) {
    this.queue = [];
    this.processFn = processFn;
    this.intervalId = null;
    this._start();
  }
  // Enqueue an email for processing
  // It increments the retry count and adds the email to the queue
  enqueue(email) {
    email.retries = (email.retries || 0) + 1; // Increment retry count
    console.log(
      `[QUEUE] Queued email with key: ${email.idempotencyKey}, retry: ${email.retries}`
    );
    this.queue.push(email); // Add email to the queue
  }

  _start() {
    // Start processing the queue at regular intervals
    if (this.intervalId) return; // Prevent multiple intervals
    this.intervalId = setInterval(async () => {
      if (this.queue.length === 0) return;
      // Process the next email in the queue
      const email = this.queue.shift();
      console.log(`[QUEUE] Processing queued email: ${email.idempotencyKey}`);

      // Attempt to process the email
      try {
        const result = await this.processFn(email);
        console.log(`[QUEUE] Email processed successfully: ${result.status}`);
      } catch (err) {
        console.error(`[QUEUE] Failed again: ${err.message}`);
        this.enqueue(email);
      }
    }, 500);
  }

  // Stop processing the queue

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Get the current length of the queue
  getLength() {
    return this.queue.length;
  }
}

module.exports = EmailQueue;
