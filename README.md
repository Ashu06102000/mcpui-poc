# Antigravity OS / MCP UI Proof of Concept

A proof of concept demonstrating the integration of the Model Context Protocol (MCP) with a dynamic React frontend and the Anthropic Claude API.

## 🚀 Features

- **Dynamic UI Generation**: Allows the AI to render customized React components directly in the chat interface using the `@mcp-ui/client`.
- **MCP Server Integration**: Communicates with a local MCP server to execute tools and obtain data for the AI.
- **Anthropic Claude Integration**: Uses Claude to power the conversational AI interface and intelligently call MCP tools.
- **Modern UI/UX**: Built with React, Tailwind CSS (via Vite), and Lucide styling for a premium aesthetic.

## 🛠 Prerequisites

- Node.js (v18 or higher recommended)
- `npm` or `yarn`

## 📦 Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment Variables:**

   Create a `.env` file in the root of the project and add your Anthropic API key:

   ```env
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

   *Note: Do not commit the `.env` file to version control.*

3. **Start the MCP Server:**

   Open a terminal and start the backend MCP server (which provides the tools to the AI):

   ```bash
   npm run mcp-server
   ```

   The server will start on port `3001`.

4. **Start the React Frontend:**

   Open a new terminal and run the Vite development server:

   ```bash
   npm run dev
   ```

   The application will be accessible at `http://localhost:5173`.

## 🏗 Architecture

- **Frontend (`src/App.tsx`)**: Manages the chat interface, sends messages to the Anthropic API via the `aiManager`, and renders the AI's responses and UI components.
- **AI Manager (`src/lib/ai.ts`)**: Handles the initialization of the Anthropic SDK, message formatting, and tool execution parsing.
- **MCP Manager (`src/lib/mcp.ts`)**: Connects to the local MCP server via Server-Sent Events (SSE) using `@modelcontextprotocol/sdk` to retrieve available tools and execute them.
- **UI Components (`src/components/ui/`)**: Reusable UI elements tailored for a clean, modern look.

## 📝 Scripts

- `npm run dev`: Starts the Vite frontend dev server.
- `npm run mcp-server`: Starts the Express/MCP backend server.
- `npm run build`: Compiles TypeScript and builds the frontend for production.
- `npm run lint`: Runs ESLint on the project.
