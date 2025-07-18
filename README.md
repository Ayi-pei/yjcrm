# NexusDesk - Multi-Agent Customer Support System

NexusDesk is a modern, web-based customer support chat application built with React and TypeScript. It provides a complete solution for businesses to manage customer interactions, featuring distinct interfaces for administrators, support agents, and visitors.

The entire application is self-contained and runs in the browser, using a sophisticated mock API to simulate a full backend for demonstration and development purposes.

## Core Technologies

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6 (using `HashRouter`)
- **State Management**: Zustand
- **UI Components**: Headless UI for modals and menus
- **File Handling**: React Dropzone

## How to Run the Application

This project is a static web application and does not require a complex build process.

1.  **Prerequisite**: You need a local web server to serve the files correctly. If you have Node.js installed, you can use the `serve` package.
    - Install `serve` globally: `npm install -g serve`
2.  **Start the Server**:
    - Navigate to the project's root directory in your terminal.
    - Run the command: `serve`
3.  **Access the App**:
    - Open your web browser and go to the local address provided by the server (e.g., `http://localhost:3000`).

## Project Structure

```
.
├── components/         # React components, organized by feature/page
│   ├── admin/          # Components for the admin panel
│   ├── agent/          # Components for the agent interface
│   ├── pages/          # Top-level page components for each route
│   ├── shared/         # Components used across multiple pages (e.g., Sidebar)
│   └── ui/             # Generic, reusable UI elements (e.g., Button, Modal)
├── services/           # Mock API and other services
│   └── mockApi.ts      # Simulates the backend, manages all data in-memory
├── stores/             # Zustand state management stores
│   ├── adminStore.ts   # State for the admin panel (keys, agents)
│   ├── agentStore.ts   # State for the agent dashboard (chats, customers)
│   └── authStore.ts    # Global authentication state (current user, key)
├── App.tsx             # Main application component with routing logic
├── constants.tsx       # Application-wide constants (icons, names)
├── index.html          # The main HTML entry point, includes importmap for dependencies
├── index.tsx           # React application entry point
├── types.ts            # All TypeScript type definitions
└── README.md           # This documentation file
```

## Key Features & Functionality

### 1. Authentication

- **Key-Based Login**: The system uses access keys instead of traditional username/passwords.
- **Roles**: Keys can be for an `admin` or an `agent`, granting access to different parts of the application.
- **State**: The `authStore` manages the current user's session, which is persisted in `sessionStorage`.

**Test Keys:**
-   **Admin Key**: `ADMIN-SUPER-SECRET`
-   **Agent "Alice" Key**: `AGENT-ALICE-123`
-   **Agent "Bob" Key** (Suspended): `AGENT-BOB-456`

### 2. Admin Panel (`/admin`)

Accessed with an admin key.

-   **Dashboard**: Provides at-a-glance statistics about total agents, online agents, and key status.
-   **Key Management**: A full CRUD interface for managing access keys. Admins can create, edit, delete, suspend, and activate keys.
-   **Agent Management**: A view-only list of all agents in the system, showing their status, session load, and unique `shareId`.

### 3. Agent Interface (`/agent`)

Accessed with an agent key.

-   **Live Chat UI**: A three-column layout for professional chat management.
    -   **Customer List**: A list of all active and pending conversations.
    -   **Chat Window**: The main area for interacting with a selected customer, including message history and a message input form.
    -   **Customer Details**: Displays information about the selected customer (IP address, device info, etc.).
-   **Agent Settings**:
    -   **Profile**: Agents can change their display name and generate a new random avatar.
    -   **Status**: Agents can set their status to `online`, `busy`, or `offline` from the sidebar.
    -   **Quick Replies, Welcome Messages, Blacklist**: Fully functional settings to manage chat shortcuts, automated greetings, and block specific IPs.
    -   **Share Link & QR Code**: Each agent has a unique link and corresponding QR code to share with visitors.

### 4. Visitor Chat (`/chat/:shareId`)

-   **Dynamic Routing**: Visitors access the chat using an agent-specific URL (e.g., `.../#/chat/chat-with-alice`).
-   **Session Creation**: The mock API automatically creates a new customer and chat session when a visitor connects.
-   **Real-Time Communication**: The interface polls the mock API to simulate real-time message updates from the agent.

## State Management (Zustand)

-   **`authStore`**: Handles global user state. `login`, `logout`, `updateCurrentUser`.
-   **`adminStore`**: Manages data for the admin panel. `fetchDashboardData`, `createKey`, `updateKey`, `deleteKey`.
-   **`agentStore`**: Manages all data for the agent view. `fetchAgentData`, `setActiveSessionId`, `sendMessage`, `updateSettings`.

## Mock API

The file `services/mockApi.ts` is the heart of the application's data layer.
-   **In-Memory Database**: It contains a `DB` object that holds all users, keys, sessions, messages, etc., in memory.
-   **Async Simulation**: All functions are `async` and use a `networkDelay` to simulate real network latency.
-   **Data Manipulation**: It uses the `immer` library (`produce`) for safe and immutable updates to the state, preventing common bugs.
