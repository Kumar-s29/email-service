const EmailService = require("./EmailService");
const emailService = new EmailService(false);

// This script tests the EmailService by sending multiple emails
// It simulates sending emails with idempotency keys to check for duplicates
// and ensures that the queue system works correctly.
// It logs the status of each email sent, including success, failure, duplicates, and queued emails.
(async () => {
  for (let i = 0; i < 10; i++) {
    const email = {
      to: `test${i}@mail.com`,
      subject: "Queue Test",
      body: "Testing queue system",
      idempotencyKey: `queue${i}`,
    };

    const res = await emailService.sendEmail(email);
    console.log(`Initial send ${i + 1}:`, res.status);
  }
})();
