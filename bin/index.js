#!/usr/bin/env node

import prompts from 'prompts';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// --- Global State for Cleanup ---
let isGenerating = false;
let currentProjectPath = '';

// --- Signal Handling ---
process.on('SIGINT', () => {
    console.log('\n\n❌ Project creation cancelled by user.');
    if (isGenerating && currentProjectPath && fs.existsSync(currentProjectPath)) {
        console.log('🧹 Cleaning up partial files...');
        try { fs.rmSync(currentProjectPath, { recursive: true, force: true }); } catch (e) { }
    }
    process.exit(1);
});

// --- Constants & Configs ---

const FRONTEND_CHOICES = [
    { title: 'React', value: 'React' },
    { title: 'Next.js', value: 'Next.js' },
    { title: 'Vue', value: 'Vue' },
    { title: 'Angular', value: 'Angular' },
    { title: 'Svelte', value: 'Svelte' }
];

const BACKEND_CHOICES = [
    { title: 'Node + Express', value: 'Node + Express' },
    { title: 'Node + Fastify', value: 'Node + Fastify' },
    { title: 'Flask', value: 'Flask' },
    { title: 'Django', value: 'Django' }
];

const DATABASE_CHOICES = [
    { title: 'MongoDB', value: 'MongoDB' },
    { title: 'PostgreSQL', value: 'PostgreSQL' },
    { title: 'MySQL', value: 'MySQL' },
    { title: 'Firebase Firestore', value: 'Firebase Firestore' }
];

const AUTH_CHOICES = [
    { title: 'JWT', value: 'JWT' },
    { title: 'Firebase Auth', value: 'Firebase Auth' }
];

// --- Generators & Strategies ---

const frontendStrategies = {
    'React': 'npx -y create-react-app .',
    'Next.js': 'npx -y create-next-app@latest . --yes',
    'Vue': 'npm create vue@latest . -- --yes',
    'Angular': (projectName) => `npx -p @angular/cli ng new ${projectName}-client --directory . --skip-install --defaults`,
    'Svelte': 'npm create svelte@latest .'
};

const dbConfigStrategies = {
    'MongoDB': {
        package: 'mongoose',
        getContent: () => `const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;`
    },
    'PostgreSQL': {
        package: 'pg',
        getContent: () => `const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DB_CONNECTION_STRING });
const connectDB = async () => {
  try { await pool.connect(); console.log('PostgreSQL Connected'); }
  catch (err) { console.error(err.message); process.exit(1); }
};
module.exports = { connectDB, pool };`
    },
    'MySQL': {
        package: 'mysql2',
        getContent: () => `const mysql = require('mysql2/promise');
const connectDB = async () => {
  try {
      const connection = await mysql.createConnection(process.env.DB_CONNECTION_STRING);
      console.log('MySQL Connected');
      return connection;
  } catch (err) { console.error(err.message); process.exit(1); }
};
module.exports = connectDB;`
    },
    'Firebase Firestore': {
        package: 'firebase-admin',
        getContent: () => `const admin = require('firebase-admin');
const connectDB = async () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(), // Or use service account
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }
    console.log('Firebase Firestore Connected');
  } catch (err) { console.error(err.message); process.exit(1); }
};
module.exports = connectDB;`
    }
};

const templates = {
    express: {
        server: `require('dotenv').config({ path: '../.env' });
const app = require('./app');
const connectDB = require('./config/db');

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server started on port \${PORT}\`));`,
        app: `const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

module.exports = app;`,
        authRoute: (isFirebase) => {
            if (isFirebase) {
                return `const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Middleware to verify Firebase Token
const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

router.get('/me', verifyToken, (req, res) => {
    res.json(req.user);
});

module.exports = router;`;
            }
            return `const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Mock User DB for demo
const users = []; 

router.post('/register', (req, res) => {
    const { email, password } = req.body;
    // In production: Hash password, save to DB
    users.push({ email, password }); 
    const payload = { user: { email } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    // In production: Find user, compare hash
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    
    const token = jwt.sign({ user: { email } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

module.exports = router;`;
        }
    },
    flask: {
        app: (dbType) => `from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

app = Flask(__name__)
CORS(app)

# Database Setup
if '${dbType}' == 'PostgreSQL' or '${dbType}' == 'MySQL':
    from flask_sqlalchemy import SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DB_CONNECTION_STRING')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)
    
    class User(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(80), unique=True, nullable=False)

    with app.app_context():
        db.create_all()

@app.route('/')
def hello():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == '__main__':
    app.run(port=int(os.environ.get('PORT', 5000)))`
    }
};

// --- Helpers ---

function validateStack(backend, database, auth) {
    const errors = [];
    const isNode = backend.startsWith('Node');
    const isFlask = backend === 'Flask';
    const isDjango = backend === 'Django';

    // Database Validation
    if (isFlask && database === 'MongoDB') errors.push("Flask + MongoDB is invalid. Flask only supports SQL (PostgreSQL/MySQL) in this CLI.");
    if (isDjango && database === 'MongoDB') errors.push("Django + MongoDB is invalid. Django best supports SQL.");
    if (isFlask && database === 'Firebase Firestore') errors.push("Flask + Firestore is invalid.");
    if (isDjango && database === 'Firebase Firestore') errors.push("Django + Firestore is invalid.");

    // Auth Validation
    if ((isFlask || isDjango) && auth === 'Firebase Auth') errors.push(`${backend} cannot use Firebase Auth. Use JWT.`);
    if (database === 'Firebase Firestore' && auth !== 'Firebase Auth') errors.push("Firestore requires Firebase Auth.");
    if (auth === 'JWT' && database === 'Firebase Firestore') errors.push("JWT cannot be used with Firestore. Use Firebase Auth.");

    return errors;
}

function checkTemplateExistence(backend, database) {
    // Basic check to ensure we have a template strategy or logic
    if (backend === 'Flask' && (database === 'PostgreSQL' || database === 'MySQL')) return true;
    if (backend === 'Flask' && database === 'MongoDB') return false; // Handled by validator, but double check
    if (backend === 'Django') return true; // Standard logic
    if (backend.startsWith('Node')) {
        if (!dbConfigStrategies[database]) return false;
        if (backend.includes('Express') && !templates.express) return false;
    }
    return true;
}

// Safer exec function
async function runCommandSafe(command, cwd) {
    try {
        execSync(command, { cwd, stdio: 'inherit' });
        return true;
    } catch (e) {
        console.error(`\n❌ Command failed: ${command}`);
        const response = await prompts({
            type: 'select',
            name: 'action',
            message: 'Installation failed. How would you like to proceed?',
            choices: [
                { title: 'Continue (Skip this step)', value: 'continue' },
                { title: 'Abort Project Creation', value: 'abort' }
            ]
        });
        if (response.action === 'abort') {
            throw new Error('User aborted after install failure.');
        }
        return false;
    }
}

// --- README Generator ---
function generateReadme(projectName, fe, be, db, auth) {
    return `# ${projectName}

## 🚀 Stack Overview
- **Frontend**: ${fe}
- **Backend**: ${be}
- **Database**: ${db}
- **Authentication**: ${auth}

## 📋 Prerequisites
- **Node.js**: Required for Frontend and Node.js backends.
- **Python**: Required if using Flask or Django.
- **Database**: Ensure ${db} is running locally or you have a cloud connection string.

## 🛠️ Installation & Setup

### 1. Environment Setup
A local \`.env\` file has been generated with your configuration.
Check the \`.env\` file in the root to ensure your keys and connection strings are correct.

### 2. Backend Setup
\`\`\`bash
cd server
# Install dependencies (if not already installed)
${be.startsWith('Node') ? 'npm install' : 'pip install -r requirements.txt'}

# Start Server
${be.startsWith('Node') ? 'npm start' : be === 'Flask' ? 'python app.py' : 'python manage.py runserver'}
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd client
# Install dependencies
npm install

# Start Development Server
npm start
\`\`\`

## 🏃 Running the Project
1. Open two terminal windows.
2. In the first window, start the backend (see above).
3. In the second window, start the frontend (see above).
4. Open your browser to the URL shown in the frontend terminal (usually http://localhost:3000 or 5173).

## 📂 Project Structure
\`\`\`
${projectName}/
├── client/           # Frontend Application
├── server/           # Backend Application
├── .env              # Environment Variables
└── README.md         # This file
\`\`\`

## 🛑 common Issues
- **Connection Refused**: Check if your database is running and the connection string in \`.env\` is correct.
- **Port In Use**: If port 5000 or 3000 is taken, update \`.env\` or the start scripts.

Enjoy coding! 🚀
`;
}

// --- Main CLI ---

async function run() {
    let args = process.argv.slice(2);
    let projectName = args[0];

    // --- 1. Folder Check Logic ---
    if (!projectName) {
        const res = await prompts({
            type: 'text',
            name: 'name',
            message: 'What is your project name?',
            validate: v => v.trim() !== '' ? true : 'Required'
        });
        projectName = res.name;
    }

    if (!projectName) process.exit(1);

    currentProjectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(currentProjectPath)) {
        console.log(`\n⚠️  Folder '${projectName}' already exists.`);
        const res = await prompts({
            type: 'select',
            name: 'action',
            message: 'Choose an action:',
            choices: [
                { title: 'Overwrite (Delete existing)', value: 'overwrite' },
                { title: 'Enter a new name', value: 'rename' },
                { title: 'Exit', value: 'exit' }
            ],
            initial: 0
        });

        if (res.action === 'exit' || !res.action) process.exit(0);
        if (res.action === 'rename') {
            const newNameFn = await prompts({
                type: 'text',
                name: 'name',
                message: 'Enter new project name:',
                validate: v => {
                    if (v.trim() === '') return 'Required';
                    if (fs.existsSync(path.join(process.cwd(), v))) return 'Folder still exists!';
                    return true;
                }
            });
            if (!newNameFn.name) process.exit(0);
            projectName = newNameFn.name;
            currentProjectPath = path.join(process.cwd(), projectName);
        } else if (res.action === 'overwrite') {
            try {
                fs.rmSync(currentProjectPath, { recursive: true, force: true });
                console.log('🗑️  Existing directory removed.');
            } catch (e) {
                console.error('❌ Could not remove directory. Check permissions.');
                process.exit(1);
            }
        }
    }

    console.log(`\n🚀 Initializing project: ${projectName}\n`);

    // --- 2. Interactive Selection ---

    const feRes = await prompts({
        type: 'select',
        name: 'frontend',
        message: 'Select frontend framework',
        choices: FRONTEND_CHOICES
    });
    if (!feRes.frontend) process.exit(1);

    const beRes = await prompts({
        type: 'select',
        name: 'backend',
        message: 'Select backend framework',
        choices: BACKEND_CHOICES
    });
    if (!beRes.backend) process.exit(1);

    let dbRes;
    while (true) {
        dbRes = await prompts({
            type: 'select',
            name: 'database',
            message: 'Select database',
            choices: DATABASE_CHOICES
        });
        if (!dbRes.database) process.exit(1);

        const tempErrors = validateStack(beRes.backend, dbRes.database, 'JWT');
        const dbErrors = tempErrors.filter(e =>
            e.includes(dbRes.database) && (e.includes(beRes.backend) || e.includes('invalid')) && !e.includes('Auth')
        );

        if (dbErrors.length > 0) {
            console.error('\n❌ Invalid Backend + Database Combination:');
            dbErrors.forEach(e => console.error(`  - ${e}`));
            continue;
        }
        break;
    }

    let authRes;
    while (true) {
        authRes = await prompts({
            type: 'select',
            name: 'auth',
            message: 'Select authentication method',
            choices: AUTH_CHOICES
        });
        if (!authRes.auth) process.exit(1);

        const errors = validateStack(beRes.backend, dbRes.database, authRes.auth);
        if (errors.length > 0) {
            console.error('\n❌ Invalid Stack Configuration:');
            errors.forEach(e => console.error(`  - ${e}`));
            continue;
        }
        break;
    }

    // --- 3. Configuration & Validation ---

    const configRes = await prompts([
        {
            type: (prev) => dbRes.database !== 'Firebase Firestore' ? 'text' : null,
            name: 'dbConnection',
            message: 'Enter database connection string:',
            validate: value => {
                if (value.trim() === '') return 'Required';
                if (dbRes.database === 'MongoDB') {
                    if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://'))
                        return 'Must start with mongodb:// or mongodb+srv://';
                }
                if (dbRes.database === 'PostgreSQL') {
                    if (!value.startsWith('postgresql://') && !value.startsWith('postgres://'))
                        return 'Must start with postgresql://';
                }
                if (dbRes.database === 'MySQL') {
                    if (!value.startsWith('mysql://'))
                        return 'Must start with mysql://';
                }
                return true;
            }
        },
        {
            type: (prev) => (dbRes.database === 'Firebase Firestore' || authRes.auth === 'Firebase Auth') ? 'text' : null,
            name: 'firebaseProject',
            message: 'Enter Firebase Project ID:',
            validate: value => value.trim() !== '' ? true : 'Required'
        },
        {
            type: (prev) => authRes.auth === 'JWT' ? 'text' : null,
            name: 'jwtSecret',
            message: 'Enter JWT secret key:',
            validate: value => value.trim() !== '' ? true : 'Required'
        }
    ], { onCancel: () => process.exit(0) });

    // --- 4. Pre-Check ---
    if (!checkTemplateExistence(beRes.backend, dbRes.database)) {
        console.error("❌ Critical Error: Required template not found for selected stack.");
        process.exit(1);
    }

    console.log('\n=============================================');
    console.log('✨  Stack Configuration Confirmed  ✨');
    console.log('=============================================');
    console.log(`📦 Frontend: ${feRes.frontend}`);
    console.log(`⚙️  Backend:  ${beRes.backend}`);
    console.log(`🗄️  Database: ${dbRes.database}`);
    console.log(`🔐 Auth:     ${authRes.auth}`);
    console.log('=============================================\n');

    // --- 5. Atomic Generation ---
    isGenerating = true;

    try {
        console.log(`[1/4] 📂 Creating project directory...`);
        fs.mkdirSync(currentProjectPath);
        fs.mkdirSync(path.join(currentProjectPath, 'client'));
        fs.mkdirSync(path.join(currentProjectPath, 'server'));

        console.log(`[2/4] 📄 Configuring environment...`);
        let envContent = '';
        if (configRes.jwtSecret) envContent += `JWT_SECRET=${configRes.jwtSecret}\n`;
        if (configRes.dbConnection) {
            envContent += `DB_CONNECTION_STRING=${configRes.dbConnection}\n`;
            if (dbRes.database === 'MongoDB') envContent += `MONGO_URI=${configRes.dbConnection}\n`;
        }
        if (configRes.firebaseProject) envContent += `FIREBASE_PROJECT_ID=${configRes.firebaseProject}\n`;

        fs.writeFileSync(path.join(currentProjectPath, '.env'), envContent);

        console.log(`[3/4] 🎨 Setting up Frontend (${feRes.frontend})...`);
        let cmd = frontendStrategies[feRes.frontend];
        if (typeof cmd === 'function') cmd = cmd(projectName);

        // Try install, support continue on fail
        await runCommandSafe(cmd, path.join(currentProjectPath, 'client'));

        console.log(`[4/4] 🛠️  Setting up Backend (${beRes.backend})...`);
        const serverPath = path.join(currentProjectPath, 'server');

        // Backend Gen Logic ... (reusing previous logic but inside try/catch)
        if (beRes.backend.startsWith('Node')) {
            execSync('npm init -y', { cwd: serverPath, stdio: 'ignore' });

            let deps = ['dotenv', 'cors'];
            if (beRes.backend.includes('Express')) deps.push('express');
            else deps.push('fastify', '@fastify/cors');

            if (dbRes.database === 'MongoDB') deps.push('mongoose');
            if (dbRes.database === 'PostgreSQL') deps.push('pg');
            if (dbRes.database === 'MySQL') deps.push('mysql2');
            if (dbRes.database === 'Firebase Firestore') deps.push('firebase-admin');

            if (authRes.auth === 'JWT') deps.push('jsonwebtoken', 'bcryptjs');
            if (authRes.auth === 'Firebase Auth' && !deps.includes('firebase-admin')) deps.push('firebase-admin');

            console.log('      Installing dependencies...');
            await runCommandSafe(`npm install ${deps.join(' ')}`, serverPath);

            ['config', 'models', 'routes', 'middleware'].forEach(d => {
                if (!fs.existsSync(path.join(serverPath, d))) fs.mkdirSync(path.join(serverPath, d));
            });

            let dbConfigFunc = dbConfigStrategies[dbRes.database]?.getContent;
            if (dbConfigFunc) fs.writeFileSync(path.join(serverPath, 'config', 'db.js'), dbConfigFunc());

            if (beRes.backend.includes('Express')) {
                fs.writeFileSync(path.join(serverPath, 'server.js'), templates.express.server);
                fs.writeFileSync(path.join(serverPath, 'app.js'), templates.express.app);
                fs.writeFileSync(path.join(serverPath, 'routes', 'auth.js'), templates.express.authRoute(authRes.auth === 'Firebase Auth'));
            } else {
                const fastifyServer = `require('dotenv').config({ path: '../.env' });
const fastify = require('fastify')({ logger: true });
fastify.register(require('@fastify/cors'));
${dbRes.database === 'MongoDB' ? "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('Mongo Connected')).catch(err => console.error(err));" : ''}
fastify.get('/', async () => ({ hello: 'world' }));
const start = async () => { try { await fastify.listen({ port: process.env.PORT || 5000 }); } catch (err) { fastify.log.error(err); process.exit(1); } };
start();`;
                fs.writeFileSync(path.join(serverPath, 'server.js'), fastifyServer);
            }
        }
        else if (beRes.backend === 'Flask') {
            execSync('python -m venv venv', { cwd: serverPath });
            const pip = process.platform === 'win32' ? 'venv\\Scripts\\pip' : 'venv/bin/pip';
            let pyDeps = 'flask flask-cors python-dotenv';
            if (dbRes.database === 'PostgreSQL') pyDeps += ' flask-sqlalchemy psycopg2-binary';
            if (dbRes.database === 'MySQL') pyDeps += ' flask-sqlalchemy mysql-connector-python';
            if (authRes.auth === 'JWT') pyDeps += ' pyjwt';

            console.log('      Installing Python dependencies...');
            await runCommandSafe(`${pip} install ${pyDeps}`, serverPath);
            fs.writeFileSync(path.join(serverPath, 'app.py'), templates.flask.app(dbRes.database));
        }
        else if (beRes.backend === 'Django') {
            execSync('python -m venv venv', { cwd: serverPath });
            const pip = process.platform === 'win32' ? 'venv\\Scripts\\pip' : 'venv/bin/pip';
            const python = process.platform === 'win32' ? 'venv\\Scripts\\python' : 'venv/bin/python';
            let djangoDeps = 'django djangorestframework python-dotenv django-cors-headers';
            if (dbRes.database === 'PostgreSQL') djangoDeps += ' psycopg2-binary';
            if (dbRes.database === 'MySQL') djangoDeps += ' mysqlclient';

            console.log('      Installing Django dependencies...');
            await runCommandSafe(`${pip} install ${djangoDeps}`, serverPath);
            await runCommandSafe(`${python} -m django startproject config .`, serverPath);
            fs.writeFileSync(path.join(serverPath, 'README.md'), '# Django Apps\n\nConfigure .env and run python manage.py runserver');
        }

        // --- 6. README Generation ---
        console.log('      📄 Generating README.md...');
        fs.writeFileSync(path.join(currentProjectPath, 'README.md'), generateReadme(projectName, feRes.frontend, beRes.backend, dbRes.database, authRes.auth));

        console.log('\n=============================================');
        console.log('🎉 Project Ready!');
        console.log('=============================================');
        console.log(`📁 Project: ${projectName}`);
        console.log(`📦 Stack: ${feRes.frontend} + ${beRes.backend} + ${dbRes.database} + ${authRes.auth}`);
        console.log('\n📖 Next Steps:');
        console.log(' - Read README.md');
        console.log(' - Configure .env');
        console.log(' - Run frontend & backend');
        console.log('=============================================\n');

    } catch (e) {
        console.error('\n❌ Fatal Error during generation:', e.message);
        console.log('🧹 Rolling back changes...');
        if (currentProjectPath && fs.existsSync(currentProjectPath)) {
            try { fs.rmSync(currentProjectPath, { recursive: true, force: true }); } catch (err) { console.error('Failed to cleanup.'); }
        }
        console.log('❌ Project creation failed. All changes reverted.');
        process.exit(1);
    }
}

run().catch(console.error);
