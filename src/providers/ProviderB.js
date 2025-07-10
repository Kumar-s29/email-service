class ProviderB {
  constructor() {
    this.name = "ProviderB";
  }
  // Simulates sending email with 80% success rate
  send(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() < 0.8; // 80% success rate
        if (success) {
          resolve({
            provider: this.name,
            status: "success",
            message: `Email sent successfully by ${this.name}`,
            email: email,
          });
        } else {
          reject(new Error(`Failed to send email by ${this.name}`));
        }
      }, 100);
    });
  }
}

// Export the ProviderB class
module.exports = ProviderB;
