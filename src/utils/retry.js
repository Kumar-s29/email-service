//This file implements a retry mechanism with exponential backoff for asynchronous functions.
// It retries the function a specified number of times with increasing delays between attempts.

async function retryWithBackoff(fn, retries = 3, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(
        `[WARN] Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`
      );

      // Wait for the specified delay before retrying
      // Exponential backoff: double the delay for the next attempt
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
}
module.exports = retryWithBackoff;
