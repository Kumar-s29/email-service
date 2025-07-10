const express = require("express");
const bodyParser = require("body-parser");
const EmailService = require("./EmailService");

const app = express();
const port = process.env.PORT || 3000;
const emailService = new EmailService();

app.use(bodyParser.json());

// POST endpoint to send email
app.post("/send-email", async (req, res) => {
  const email = req.body;

  try {
    const result = await emailService.sendEmail(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// GET endpoint to check email status
app.get("/status/:id", (req, res) => {
  const id = req.params.id;
  const status = emailService.getStatus(id);
  res.json(status || { message: "Not found" });
});

// Health check
app.get("/", (req, res) => {
  res.send("Email Service is running!");
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
