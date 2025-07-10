const ProviderA = require("./providers/ProviderA");
const ProviderB = require("./providers/ProviderB");
const RateLimiter = require("./utils/rateLimiter");
const IdempotencyStore = require("./utils/idempotencyStore");
const { logInfo, logWarn, logError } = require("./utils/logger");
const retryWithBackoff = require("./utils/retry");
const EmailQueue = require("./utils/EmailQueue");
const CircuitBreaker = require("./utils/circuitBreaker");

// This file implements an EmailService that manages sending emails through multiple providers,
// handles rate limiting, retries with exponential backoff, and maintains an idempotency store to
// prevent duplicate email sending. It also supports a queue for processing emails when providers are
// temporarily unavailable or when rate limits are hit.
// The service uses circuit breakers to prevent overwhelming providers that are failing or overloaded.
// It logs the status of each email sent, including success, failure, duplicates, and queued emails.
// The EmailService can be configured to enable or disable the queue, and it provides methods to
// retrieve the status of sent emails and the queue length for monitoring purposes.

class EmailService {
  constructor(enableQueue = true, providerA = null, providerB = null) {
    // Initialize providers A and B, defaulting to ProviderA and ProviderB if not provided
    // This allows for easy testing and swapping of providers without changing the service code
    this.providerA = providerA || new ProviderA();
    this.providerB = providerB || new ProviderB();

    // Initialize rate limiter to control the number of requests sent to providers
    // This helps to prevent overwhelming the providers and ensures compliance with their rate limits
    this.rateLimiter = new RateLimiter(5);
    this.sentEmails = new Map();
    this.idempotencyStore = new IdempotencyStore();
    this.statusLog = new Map();

    // Initialize circuit breakers for each provider
    // Circuit breakers help to prevent sending requests to providers that are failing or overloaded

    this.cbA = new CircuitBreaker();
    this.cbB = new CircuitBreaker();

    // Enable or disable the email queue based on the constructor parameter
    // If enabled, the queue will process emails that cannot be sent immediately

    this.enableQueue = enableQueue;
    this.queue = enableQueue
      ? new EmailQueue(this.processQueuedEmail.bind(this))
      : null;
  }

  // This method processes queued emails by attempting to send them
  // It is called by the EmailQueue when an email is ready to be processed
  async processQueuedEmail(email) {
    try {
      return await this.sendEmail(email);
    } catch (err) {
      throw err;
    }
  }

  // This method attempts to send an email using the specified provider
  // It retries sending the email with exponential backoff if the provider fails
  async sendWithRetry(
    provider,
    email,
    providerName,
    circuitBreaker,
    idempotencyKey
  ) {
    if (!circuitBreaker.canRequest()) {
      if (this.queue) this.queue.enqueue(email);
      this.statusLog.set(idempotencyKey, {
        idempotencyKey,
        timestamp: new Date().toISOString(),
        provider: providerName,
        status: "queued_due_to_circuit",
        retries: 0,
      });
      throw new Error(
        `${providerName} is temporarily disabled. Queued for retry.`
      );
    }

    let retries = 0;

    // Use retryWithBackoff utility to handle retries with exponential backoff
    // This will retry sending the email up to 3 times with a delay of 500
    const result = await retryWithBackoff(
      async () => {
        retries++;
        return await provider.send(email);
      },
      3,
      500
    );

    if (!result || result.status !== "success") {
      throw new Error("Provider failed after retries");
    }

    circuitBreaker.success();

    this.statusLog.set(idempotencyKey, {
      idempotencyKey,
      timestamp: new Date().toISOString(),
      provider: providerName,
      status: "success",
      retries: retries - 1,
    });

    return { ...result, used: providerName };
  }

  // This method sends an email, handling idempotency, rate limiting, and retries
  // It checks if the email has already been sent using the idempotency key
  // If the email is a duplicate, it returns the cached response
  async sendEmail(email) {
    const { idempotencyKey } = email;

    if (!idempotencyKey) {
      return {
        status: "failure",
        message: "Idempotency key is required.",
      };
    }

    if (!this.rateLimiter.isAllowed()) {
      if (this.queue) this.queue.enqueue(email);
      this.statusLog.set(idempotencyKey, {
        idempotencyKey,
        timestamp: new Date().toISOString(),
        provider: null,
        status: "queued_due_to_rate_limit",
        retries: 0,
      });
      return {
        status: "queued",
        message: "Rate limit hit. Email has been queued for retry.",
      };
    }

    // Check if the email has already been sent using the idempotency key
    // If it has, return the cached response to avoid duplicate processing
    if (this.sentEmails.has(idempotencyKey)) {
      const cached = this.sentEmails.get(idempotencyKey);
      logInfo(`Duplicate email with key ${idempotencyKey} - skipping`);
      this.statusLog.set(idempotencyKey, {
        idempotencyKey,
        timestamp: new Date().toISOString(),
        provider: cached.used,
        status: "duplicate",
        retries: 0,
      });
      return {
        ...cached,
        status: "duplicate",
        message: "Email already sent. This is a cached response.",
      };
    }

    try {
      const result = await this.sendWithRetry(
        this.providerA,
        email,
        "ProviderA",
        this.cbA,
        idempotencyKey
      );
      this.sentEmails.set(idempotencyKey, result);
      return result;
    } catch (errorA) {
      logWarn(`ProviderA failed or circuit open: ${errorA.message}`);
      this.cbA.failure();

      try {
        const result = await this.sendWithRetry(
          this.providerB,
          email,
          "ProviderB",
          this.cbB,
          idempotencyKey
        );
        this.sentEmails.set(idempotencyKey, result);
        return result;
      } catch (errorB) {
        logError(`ProviderB also failed: ${errorB.message}`);
        this.cbB.failure();

        this.statusLog.set(idempotencyKey, {
          idempotencyKey,
          timestamp: new Date().toISOString(),
          provider: null,
          status: "failure",
          retries: 3,
        });

        return {
          status: "failure",
          message: "All providers failed to send the email after retries.",
        };
      }
    }
  }

  // This method stops the email queue processing
  // It clears the interval that processes queued emails

  stopQueue() {
    if (this.queue) {
      this.queue.stop();
    }
  }

  // This method retrieves the status of an email by its idempotency key
  // It returns the status log entry if it exists, or null if not found
  getStatus(idempotencyKey) {
    return this.statusLog.get(idempotencyKey) || null;
  }

  // For testing and debugging
  getSentEmails() {
    return this.sentEmails;
  }

  // This method retrieves the current length of the email queue
  // It returns the number of emails currently in the queue
  getQueueLength() {
    return this.queue ? this.queue.queue.length : 0;
  }
}

module.exports = EmailService;
