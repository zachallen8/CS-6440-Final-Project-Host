# Setup Guide

This guide will walk you through setting up and running the Maternal Health App on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Git**

You can verify your installations by running:

```bash
node --version
npm --version
git --version
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
```

Replace `<repository-url>` with the actual URL of this repository.

### 2. Navigate to the Project Directory

```bash
cd CS-6440-Final-Project
```

### 3. Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:
- React and React DOM
- React Router DOM for routing
- Vite for development server and build tooling
- ESLint and related plugins for code quality

### 4. Run the Development Server

Start the development server:

```bash
npm run dev
```

The application will start and you should see output similar to:

```
  VITE v6.0.5  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5. Open the Application

Open your web browser and navigate to:

```
http://localhost:5173
```

You should now see the Maternal Health App running!

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
CS-6440-Final-Project/
├── src/
│   ├── components/      # Reusable components (Sidebar)
│   ├── pages/           # Page components
│   ├── css/             # All CSS files
│   ├── App.jsx          # Main app component with routing
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

