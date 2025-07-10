## 📄 `README.md`

# 📬 Resilient Email Sending Service

A robust email sending system built in **JavaScript**, using two mock providers with support for:

✅ Retry with exponential backoff  
✅ Provider fallback  
✅ Idempotency  
✅ Rate limiting  
✅ Status tracking  
✅ Circuit breaker pattern  
✅ Simple logger  
✅ Background queue system

---

## 📦 Tech Stack

- JavaScript (Node.js)
- Jest (for testing)
- No external email services — only mock providers

---

## 🚀 Features

| Feature         | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| Retry           | Retries failed emails with exponential backoff                    |
| Fallback        | Automatically switches to backup provider if the first one fails  |
| Idempotency     | Prevents duplicate email sends with `idempotencyKey`              |
| Rate Limiting   | Limits the number of emails sent per second                       |
| Circuit Breaker | Disables failing provider temporarily and tests it after cooldown |
| Logging         | Centralized logging for all important events                      |
| Queue           | Queues failed/rate-limited emails and retries them later          |
| Status Tracking | Tracks success/failure status for each email sent                 |

---

## 🗂️ Folder Structure

```

email-service/
├── src/
│ ├── providers/ # Mock providers A and B
│ ├── utils/ # Logger, retry, rate limiter, circuit breaker, queue
│ ├── EmailService.js # Core email service
│ └── testRun.js # Sample run script
├── tests/
│ └── EmailService.test.js # Unit tests
├── package.json
└── README.md

```

---

## 🛠️ Setup Instructions

1. **Clone the repo**

```bash
git clone <your-repo-url>
cd email-service
```

2. **Install dependencies**

```bash
npm install
```

3. **Run a sample**

```bash
node src/testRun.js
```

4. **Run tests**

```bash
npm test
```

---

## 🧪 Sample Email Object

```js
{
  to: "user@example.com",
  subject: "Hello!",
  body: "This is a test email.",
  idempotencyKey: "unique-email-id-001"
}
```

---

## 🔍 Assumptions

- `idempotencyKey` is required for every email.
- The service is built for demonstration, not production.
- All data is stored **in-memory** (no DB).

---

## ✅ Evaluation Criteria (Met)

- [x] Code quality and structure
- [x] Retry + exponential backoff
- [x] Fallback mechanism
- [x] Idempotency support
- [x] Rate limiting
- [x] Circuit breaker
- [x] Logging and queue
- [x] Unit tests with Jest
- [x] README and documentation

---

## 👨‍💻 Author

**Kumara Swamy Swayamvarapu**
🔗 [GitHub](https://github.com/Kumar-s29)
📧 [swamykumar29603@gmail.com](mailto:swamykumar29603@gmail.com)
🎓 B.Tech CSE – Vignan's Institute of Information Technology

---
