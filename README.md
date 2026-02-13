# StackleVest

StackleVest is a modern, real-time collaboration platform designed for seamless team communication and task management. It combines instant messaging with powerful project management tools in a unified interface.

## 🚀 Features

- **Real-time Messaging**: Instant communication via Channels and Direct Messages (powered by Socket.io).
- **Advanced Task Management**: Integrated Kanban board with detailed task views, progress tracking, and real-time updates.
- **Admin Dashboard**: Comprehensive management of users, tasks, and system settings.
- **Global Search**: Quick navigation across messages, tasks, and channels using ⌘K.
- **Onboarding Flow**: Smooth user registration and profile setup experience.
- **Modern UI**: Built with Next.js 15, Tailwind CSS, and Fredoka Google Font for a distinct, high-end feel.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context API
- **Real-time**: Socket.io Client
- **Typography**: [Fredoka](https://fonts.google.com/specimen/Fredoka) (Google Font)
- **Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Server**: Node.js with Express & [Socket.io](https://socket.io/)
- **Persistence**: JSON-based file storage with local backup support
- **Validation**: Joi-based request validation

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AdegbolaAnjolaoluwa/stacklevest.git
    cd stacklevest
    ```

2.  **Install Frontend Dependencies**
    ```bash
    cd frontend
    npm install
    ```

3.  **Install WebSocket Server Dependencies**
    ```bash
    cd ../websocket-server
    npm install
    ```

### Running the Application

You need to run both the WebSocket server and the Frontend application simultaneously.

**1. Start the WebSocket Server**
```bash
# In the websocket-server directory
npm start
# Server runs on ws://localhost:8080
```

**2. Start the Frontend Development Server**
```bash
# In the frontend directory
npm run dev
# App runs on http://localhost:3000
```

## 🔐 Admin Access

To access the Admin Console:
- Navigate to the dashboard.
- The Admin Console link appears in the sidebar **only** for users with the `admin` role.
- **Default Admin User**: `abutankokingdavid@stacklevest.com` (King David Developer)
- *Note: Access to `/admin` routes is strictly enforced via role-based protection.*

## 📂 Project Structure

- `/frontend` - Next.js web application
- `/websocket-server` - Standalone WebSocket server for real-time features
- `/backend` - (Reserved for future backend services)

---
Developed by StackleVest Team.
