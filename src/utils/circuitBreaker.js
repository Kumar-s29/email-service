class CircuitBreaker {
  constructor(name, failureThreshold = 3, cooldownPeriod = 5000) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.cooldownPeriod = cooldownPeriod;

    this.failures = 0;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  // This method checks if the circuit breaker allows a request to be sent
  canRequest() {
    if (this.state === "OPEN") {
      if (Date.now() >= this.nextAttempt) {
        this.state = "HALF_OPEN";
        return true;
      }
      return false;
    }
    return true; // CLOSED or HALF_OPEN
  }

  // This method resets the circuit breaker state to CLOSED
  // It should be called when a request is successful
  success() {
    this.failures = 0;
    this.state = "CLOSED"; // Reset to CLOSED on success
  }

  // This method records a failure in the circuit breaker
  // If the failure threshold is reached, it transitions to OPEN state
  // and sets the next attempt time after the cooldown period

  failure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN"; // Transition to OPEN state
      this.nextAttempt = Date.now() + this.cooldownPeriod;
      console.warn(`[CIRCUIT BREAKER] ${this.name} is now OPEN`);
    }
  }
}

module.exports = CircuitBreaker;
