class ProviderA {
  constructor() {
    this.name = "ProviderA";
  }
  //Simulates sending email with 70% success rate
  send(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() < 0.7; // 70% success rate
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

// Export the ProviderA class
module.exports = ProviderA;
