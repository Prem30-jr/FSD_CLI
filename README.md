# 🚀 fs-init-myapp

[![npm version](https://img.shields.io/npm/v/fs-init-myapp.svg)](https://www.npmjs.com/package/fs-init-myapp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Introduction

**fs-init-myapp** is a powerful CLI tool designed to take the friction out of starting a new full-stack project. Instead of spending hours configuring folders, wiring databases, and setting up authentication, you can generate a production-ready scaffold in seconds with a single command.

It works like `npm init`, but for modern, real-world full-stack architectures. Whether you need a React + Express + MongoDB stack or a Svelte + Flask + PostgreSQL setup, this tool handles the heavy lifting, including safety checks and automatic rollbacks.

---

## ✨ Features

- **One-Command Scaffolding**: Generate a fully working full-stack project instantly.
- **🔧 Interactive CLI**: Sleek, user-friendly prompts with arrow-key selection.
- **📦 Clean Architecture**: Auto-generates separate `client/` and `server/` structures.
- **🔗 Smart Wiring**: Automatically configures database connections based on your input.
- **🔐 Built-in Auth**: Standard JWT or Firebase authentication setup ready to go.
- **🧪 Compatibility Guard**: Validates your stack to prevent invalid technology combinations.
- **♻️ Atomic Generation**: Performs a safe rollback if any part of the setup fails.
- **🚫 Robust Error Handling**: Gracefully handles `Ctrl+C`, existing folders, and network issues.
- **📄 Documentation**: Generates a custom `README.md` for every project created.
- **🌍 Global Access**: Install once, use anywhere.

---

## 🧠 Supported Tech Stack

The tool supports a wide range of modern technologies to suit your project needs:

### **Frontend**
- React, Next.js, Vue, Angular, Svelte

### **Backend**
- Node.js (Express / Fastify), Flask, Django

### **Database**
- MongoDB, PostgreSQL, MySQL, Firebase Firestore

### **Authentication**
- JWT (Json Web Token), Firebase Auth

> ⚠️ **Note:** The CLI strictly validates combinations (e.g., it will guide you toward SQL for Django/Flask) to ensure your project starts on a stable foundation.

---

## 🏗️ Safety & Edge Case Handling

We prioritize your development environment's integrity:
- **Conflict Resolution**: Detects existing folders and offers Overwrite, Rename, or Exit options.
- **Clean Abort**: Handles user interrupts (Ctrl+C) without leaving messy partial files.
- **Validation**: Rejects invalid database connection strings before they break your app.
- **Zero-Ghost Projects**: If a command fails during installation, the tool automatically wipes the partial project.

---

## 💻 Requirements

- **Node.js**: Latest LTS recommended.
- **npm**: Standard package manager.
- **Python**: Required only if selecting Flask or Django backends.

---

## 📦 Installation

You can use the tool without permanent installation via `npx`, or install it globally for faster access.

### **Using npx (Recommended)**
```bash
npx fs-init-myapp@latest <project-name>
```

### **Global Installation**
```bash
npm install -g fs-init-myapp
```

---

## 🚀 Usage

Simply run the command and follow the interactive wizard:

```bash
fs-init-myapp my-awesome-project
```

### **The Interactive Flow:**
1.  **Select Frontend**: Hand-pick your UI framework.
2.  **Select Backend**: Choose your server logic.
3.  **Select Database**: Pick your storage engine.
4.  **Database Config**: provide your connection string (validated on the fly).
5.  **Authentication**: Choose your security layer.
6.  **Secrets**: Set your JWT secret or Firebase keys.

---

## 📁 Generated Project Structure

```text
my-awesome-project/
├── client/          # Frontend application (React, Next.js, etc.)
├── server/          # Backend application (Express, Flask, etc.)
├── .env             # Pre-configured environment variables
└── README.md        # Specialized guide for your chosen stack
```

---

## ▶️ Running Your Project

### **1. Frontend**
```bash
cd client
npm install
npm run dev # or npm start
```

### **2. Backend**
```bash
cd server
# For Node:
npm install
npm start

# For Python:
pip install -r requirements.txt
python app.py
```

---

## 📌 Why This Tool?

Most starters give you a static template. **fs-init-myapp** gives you a **System**. It captures real-world developer workflows, focusing on automation, error resilience, and developer experience (DX). It's built for developers who want to skip the "boilerplate fatigue" and get straight to building features.

---

## 📈 Roadmap

- [ ] **Docker Support**: Auto-generate `Dockerfile` and `docker-compose.yml`.
- [ ] **AI-Powered Setup**: Smart recommendations based on project requirements.
- [ ] **Cloud Presets**: One-click configuration for Vercel, Heroku, and AWS.
- [ ] **Testing Suite**: Auto-include Jest/Vitest boilerplate.

---

## 🤝 Contributing & Support

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License & Author

Distributed under the **MIT License**.

**Created by [Prem Kumar](https://github.com/Prem30-jr)**
*Full Stack Developer | AI Enthusiast | Systems Thinker*

---
*If you find this tool helpful, please give it a ⭐ on [GitHub](https://github.com/Prem30-jr/FSD_CLI)!*
