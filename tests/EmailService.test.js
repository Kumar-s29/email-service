const EmailService = require("../src/EmailService");

// Mock providers for testing
// These mocks simulate the behavior of email providers for unit tests
let emailService;
let mockProviderA;
let mockProviderB;

// Mock provider A simulates a successful email send
// It resolves with a success status
// This is used to test the primary email sending functionality
// Mock provider B simulates a successful email send
// It resolves with a success status
// This is used to test the fallback mechanism when Provider A fails

beforeEach(() => {
  mockProviderA = { send: jest.fn().mockResolvedValue({ status: "success" }) };
  mockProviderB = { send: jest.fn().mockResolvedValue({ status: "success" }) };
  emailService = new EmailService(false, mockProviderA, mockProviderB);
});

// After each test, we stop the email service queue if it exists
// This ensures that no background processes are left running after tests complete
afterEach(() => {
  if (emailService?.stopQueue) {
    emailService.stopQueue();
  }
});

// Test cases for the EmailService
// These tests cover the main functionalities of the EmailService class

test("sends email successfully via ProviderA", async () => {
  const email = {
    idempotencyKey: "email-1",
    to: "test@example.com",
    subject: "Hello",
    body: "World",
  };

  // Mock the send method of ProviderA to simulate a successful email send
  // This is the primary provider used for sending emails

  const result = await emailService.sendEmail(email);

  expect(result.status).toBe("success");
  expect(result.used).toBe("ProviderA");
  expect(mockProviderA.send).toHaveBeenCalledTimes(1);
  expect(mockProviderB.send).toHaveBeenCalledTimes(0);
});

// This test checks if the email is sent successfully using ProviderA
// It verifies that the email is sent and the correct provider is used
// It also ensures that ProviderB is not called in this case
test("falls back to ProviderB if ProviderA fails", async () => {
  mockProviderA.send.mockRejectedValue(new Error("ProviderA down"));

  const email = {
    idempotencyKey: "email-2",
    to: "test@example.com",
    subject: "Hi",
    body: "Fallback test",
  };

  // This test simulates a failure in ProviderA
  // It checks if the EmailService correctly falls back to ProviderB
  // It verifies that the email is sent successfully using ProviderB
  const result = await emailService.sendEmail(email);

  expect(result.status).toBe("success");
  expect(result.used).toBe("ProviderB");
  expect(mockProviderA.send).toHaveBeenCalled();
  expect(mockProviderB.send).toHaveBeenCalled();
});

// This test checks if the EmailService correctly handles idempotency
// It ensures that duplicate emails with the same idempotency key are not sent again

test("prevents duplicate sends using idempotency", async () => {
  const email = {
    idempotencyKey: "email-3",
    to: "test@example.com",
    subject: "No Dupes",
    body: "Avoid resend",
  };

  const first = await emailService.sendEmail(email);
  const second = await emailService.sendEmail(email);

  // The first send should succeed, while the second should be a duplicate
  // This test checks if the EmailService correctly identifies duplicate emails
  expect(first.status).toBe("success");
  expect(second.status).toBe("duplicate");
  expect(mockProviderA.send).toHaveBeenCalledTimes(1);
});
