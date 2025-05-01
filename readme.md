# French Vocabulary Learning App 🇫🇷

A full-stack French learning app with a **React.js frontend** and a **Python backend** running on **AWS (Lambda, DynamoDB, Cognito)**.

This app helps you build and retain French vocabulary efficiently using personalized quizzes, built-in translation, and GPT-powered grammar practice.

---

## ✨ Features

### 🧠 Vocabulary Learning

- Comes preloaded with **5,000 high-frequency French words**, gradually introduced into your quiz based on your progress.
- You can also **add your own words** using a built-in translation tool (Hebrew ⇄ French) and **automatic gender detection**.
- The app **tracks your progress**, adjusting the quiz frequency based on which words you struggle with.
- A **spaced repetition** system ensures you review difficult words more often, helping you truly memorize them.
- Each word can include **synonyms**, editable during quizzes.

### 📝 Grammar Practice

- Generate **AI-created sentences** at levels A1–C1 based on your selected grammar topics.
- Translate them into French and get **GPT-4 feedback** — including corrections and grammar explanations.

### 📈 Progress Tracking

- Easily view how many words you’ve learned.
- Quizzes dynamically adapt to your memory strength (`rate` and `lastTimeWrong` values).
- Words are read aloud using text-to-speech, and a **virtual French keyboard** helps input accents.

---

## 🛠️ Tech Stack

### Frontend

- **JavaScript + React**
- Axios for API calls
- Text-to-speech + virtual keyboard for better learning UX

### Backend (Serverless on AWS)

- **Python Lambda Functions**
- **AWS DynamoDB** for user and vocabulary data
- **AWS Cognito** for user authentication
- **Google Translate API** for translation features
- **OpenAI GPT-4 API** for grammar feedback and sentence generation

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
