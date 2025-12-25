# fs-init-myApp

## Introduction

fs-init-myApp is an npm CLI tool that generates a complete full-stack application from a single command. It works like npm init, but for real-world full-stack projects with frontend, backend, database, and authentication. The tool focuses on developer experience, safety, and automation, handling edge cases that most scaffolding tools ignore. You get a ready-to-run project instead of a half-configured template.

## Features

fs-init-myApp offers a rich feature set designed to deliver a working app with minimal effort.

- One command generates a fully working full-stack project.
- Interactive CLI with arrow-key selection, similar to npm create vite.
- Auto-generates frontend and backend folder structures.
- Automatically wires database connection into the backend layer.
- Sets up authentication using JWT by default.
- Validates stack compatibility and prevents invalid combinations.
- Performs safe rollback on failure to avoid broken projects.
- Handles Ctrl+C, folder conflicts, and npm failures gracefully.
- Generates a README automatically for each created project.
- Works globally after a one-time npm global installation.

### Supported Tech Stack

fs-init-myApp supports several popular technologies for each application layer.

- **Frontend**
  - React
  - Next.js
  - Vue
  - Angular
  - Svelte
- **Backend**
  - Node.js with Express
  - Flask
- **Database**
  - MongoDB
  - MySQL
  - PostgreSQL
- **Authentication**
  - JWT based authentication

⚠️ Only valid combinations are allowed, and the CLI blocks incompatible stacks automatically.

### Safety and Edge Case Handling

The CLI focuses strongly on safety and predictable behavior.

- Detects and handles existing folders with overwrite, rename, or exit options.
- Handles user aborts through Ctrl+C without leaving partial projects.
- Validates database URLs and rejects invalid connection strings.
- Detects missing backend templates and reports clear errors.
- Performs automatic rollback on partial generation failures.
- Handles npm or internet failures with clean, actionable error messages.
- Guarantees no half-generated or broken projects remain on disk.

## Requirements

You need a minimal environment to install and run fs-init-myApp.

- Node.js installed on your system.
- npm available in your terminal.
- Internet access to install templates and dependencies.
- Python installed if you choose Flask as backend.
- A supported operating system like Windows, macOS, or Linux.

## Installation

You can install fs-init-myApp globally from npm to use it from any folder.

1. Install the CLI globally using npm:

   ```bash
   npm install -g fs-init-myapp
   ```

2. Verify that the CLI is available:

   ```bash
   fs-init-myApp --help
   ```

3. If the command is not found, ensure your global npm bin directory is on the PATH.

## Usage

fs-init-myApp creates a new full-stack project through a guided, interactive flow. You choose frontend, backend, database, and authentication, and the tool takes care of wiring and configuration.

### Create a New Project

Run a single command to generate a new project.

```bash
fs-init-myApp myProject
```

You will be guided through an interactive prompt.

- Select frontend framework.
- Select backend framework.
- Select database.
- Enter database connection string.
- Select authentication method.
- Enter JWT secret key.

After completion, the tool generates a full-stack project that is ready to run.

### Generated Project Structure

The generated project follows a clear and conventional structure.

```text
myProject/
├── client/          # Frontend application
├── server/          # Backend application
├── .env             # Environment variables
└── README.md        # Auto-generated project guide
```

The exact contents of `client` and `server` depend on your chosen stack.

### How to Run the Generated Project

You can start both frontend and backend with simple commands.

1. **Frontend**

   ```bash
   cd client
   npm install
   npm start
   ```

   The frontend typically runs on:

   ```text
   http://localhost:3000
   ```

2. **Backend**

   For a Node.js Express backend:

   ```bash
   cd server
   npm install
   npm run dev
   ```

   For a Flask backend:

   ```bash
   cd server
   pip install -r requirements.txt
   python app.py
   ```

   The backend typically runs on:

   ```text
   http://localhost:5000
   ```

3. **Environment Variables**

   Edit the `.env` file in the backend folder to configure secrets.

   ```bash
   DATABASE_URL=your_database_url
   JWT_SECRET=your_secret_key
   ```

   Use secure values for production environments and keep this file private.

### Example Valid Database URLs

You must provide valid database URLs during project creation.

- **MongoDB**

  ```text
  mongodb://localhost:27017/myApp
  mongodb+srv://user:pass@cluster.mongodb.net/myApp
  ```

- **MySQL**

  ```text
  mysql://user:password@localhost:3306/myApp
  ```

- **PostgreSQL**

  ```text
  postgresql://user:password@localhost:5432/myApp
  ```

The CLI validates these URLs and warns if they look incorrect.

### Why This Project Is Different

Most student projects build single applications; this project builds tools that build applications. It focuses on real-world workflows rather than toy examples. The design highlights automation, error handling, and developer experience. It reflects system thinking and CLI design principles rather than only framework skills.

Key aspects demonstrated:

- CLI design for real developers.
- Automation of repetitive setup tasks.
- Strong focus on developer experience and guidance.
- Robust error handling strategies.
- Alignment with real-world project workflows.

### Roadmap

Planned future enhancements aim to increase flexibility and power.

- Firebase based authentication options.
- Docker support for easy containerization.
- AI based stack recommendation during setup.
- Cloud deployment templates for common providers.
- Plugin based architecture to extend the CLI.

### Contributing

Contributions are welcome and encouraged.

1. Fork this repository on GitHub.
2. Create a feature or bugfix branch for your change.
3. Commit your changes with clear messages.
4. Open a pull request describing your modifications.

Please follow existing patterns and keep the focus on DX and safety.

### License

This project is distributed under the MIT License. You are free to use, modify, and distribute it under the license terms.

### Author

fs-init-myApp is created and maintained by Prem Kumar. He works as a full-stack developer with a focus on AI and systems thinking.

If you like this project, consider starring the repository on GitHub.

### Final Note

If you can run the command below and get a working full-stack project, the tool has achieved its goal.

```bash
fs-init-myApp myApp
```

From that moment, you start from a ready stack instead of from scratch.

## Configuration

fs-init-myApp keeps configuration simple and relies on standard patterns. Most configuration happens during the interactive creation phase and through environment variables.

- Choose frontend, backend, database, and authentication in the CLI prompts.
- Provide a valid database URL when requested by the wizard.
- Supply a secure JWT secret key for authentication.
- Adjust environment variables in the generated `.env` file as needed.
- Customize frontend and backend code inside the `client` and `server` folders.

Internally, the CLI uses Node.js, Inquirer, and the file system to generate templates. It relies on child processes to run npm commands and uses the npm registry for global CLI distribution. The project uses a template based architecture so new stacks and patterns can be added over time.