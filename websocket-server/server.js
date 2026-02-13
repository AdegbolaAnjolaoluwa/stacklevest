const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config();
const logger = require('./logger');
const { validateFields } = require('./validation');
const { Resend } = require('resend');
const { initDB, readDB, writeDB } = require("./persistence");

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Basic request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// OTP Store (Memory)
const otpStore = new Map();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Initialize DB
try {
    initDB();
    logger.info("Database initialized successfully");
} catch (error) {
    logger.error("Failed to initialize database:", error);
    process.exit(1);
}

let db = readDB();

// Sync in-memory variables with DB
let users = db.users;
let channels = db.channels;
let messageHistory = db.messages;
let tasks = db.tasks || [];

// Helper to save current state
const saveState = () => {
  writeDB({
    users,
    channels,
    messages: messageHistory,
    tasks
  });
};

// --- REST API for Authentication ---
app.get('/api/users/email/:email', (req, res) => {
    const { email } = req.params;
    db = readDB();
    users = db.users;
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// Admin: Get All Users
app.get('/api/users', (req, res) => {
    // Refresh DB
    db = readDB();
    users = db.users;
    res.json(users);
});

// Update User Profile
app.patch('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    db = readDB();
    users = db.users;
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }
    
    // Update user fields
    users[userIndex] = { ...users[userIndex], ...updates };
    saveState();
    
    // Notify all clients about user update
    io.emit("refresh", { 
        type: 'user_updated', 
        payload: users[userIndex] 
    });
    
    res.json(users[userIndex]);
});

// Admin: Create User & Send Invite
app.post('/api/users', async (req, res) => {
    const error = validateFields(req.body, ['name', 'email']);
    if (error) {
        return res.status(400).json({ error });
    }
    
    const { name, email, role, department, jobTitle, reportingManager, staffNumber } = req.body;
    
    // Refresh DB
    db = readDB();
    users = db.users;

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: "User with this email already exists" });
    }

    const tempPassword = Math.random().toString(36).slice(-8); // Generate 8-char random password

    const newUser = {
        id: "u" + Date.now(),
        name,
        email,
        password: tempPassword,
        needsOnboarding: true, // Flag to trigger OTP & Password Change
        role: role || "STAFF",
        department: department || "General",
        jobTitle: jobTitle || "",
        reportingManager: reportingManager || "",
        staffNumber: staffNumber || "",
        status: "ACTIVE",
        avatar: "",
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveState();

    // Construct Frontend URL (Assuming frontend runs on port 3000 on the same host)
    const host = req.get('host').split(':')[0];
    const frontendUrl = `http://${host}:3000`;

    // Send Welcome Email with Login Link & Password
    try {
        await resend.emails.send({
            from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
            to: email,
            subject: 'Welcome to StackleVest',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to StackleVest!</h2>
                    <p>Hi ${name},</p>
                    <p>You have been invited to join the StackleVest workspace.</p>
                    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                        <p style="margin: 0; font-weight: bold; color: #52525b;">Your Temporary Password:</p>
                        <p style="margin: 10px 0 0 0; font-family: monospace; font-size: 24px; letter-spacing: 2px; color: #18181b; font-weight: bold;">${tempPassword}</p>
                    </div>
                    <p>Please log in using this password. You will be asked to verify your identity and set a new password.</p>
                    <a href="${frontendUrl}/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Login to Workspace</a>
                    <p>Best regards,<br>The StackleVest Team</p>
                </div>
            `
        });
        console.log(`\n=== USER CREATED ===\nEmail: ${email}\nTemp Password: ${tempPassword}\nLink: ${frontendUrl}/login\n====================\n`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // We don't fail the request if email fails, but we log it
    }

    res.json(newUser);
});

// Admin: Update User
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    db = readDB();
    users = db.users;
    
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        const user = users[index];
        const { name, role, department, jobTitle, reportingManager, staffNumber, status } = updates;
        
        if (name) user.name = name;
        if (role) user.role = role;
        if (department) user.department = department;
        if (jobTitle) user.jobTitle = jobTitle;
        if (reportingManager) user.reportingManager = reportingManager;
        if (staffNumber) user.staffNumber = staffNumber;
        if (status) user.status = status;

        saveState();
        res.json(user);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// Admin: Delete User
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    
    db = readDB();
    users = db.users;
    
    const initialLength = users.length;
    users = users.filter(u => u.id !== id);
    
    if (users.length < initialLength) {
        saveState();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.post('/api/auth/otp/request', async (req, res) => {
    const error = validateFields(req.body, ['email']);
    if (error) {
        return res.status(400).json({ error });
    }
    
    const { email } = req.body;
    
    // Refresh DB
    db = readDB();
    users = db.users;

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email.toLowerCase(), { otp, expiresAt });

    logger.info(`OTP GENERATED - User: ${email}, Code: ${otp}`);

    // Send email via Resend
    try {
        await resend.emails.send({
            from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
            to: email,
            subject: 'Your StackleVest Login Code',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Login to StackleVest</h2>
                    <p>Your one-time password is:</p>
                    <h1 style="background: #f4f4f5; padding: 20px; text-align: center; letter-spacing: 5px; border-radius: 8px;">${otp}</h1>
                    <p>This code will expire in 5 minutes.</p>
                </div>
            `
        });
        logger.info(`Email sent to ${email}`);
        res.json({ message: "OTP sent" });
    } catch (error) {
        logger.error('Error sending email:', error);
        res.status(500).json({ error: "Failed to send OTP email" });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password, otp } = req.body;
    
    // Refresh DB
    db = readDB();
    users = db.users;

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // SCENARIO 1: OTP Verification (Step 2)
    if (otp) {
        const storedOtpData = otpStore.get(email.toLowerCase());
        
        if (!storedOtpData) {
            return res.status(401).json({ error: "No OTP requested or expired" });
        }

        if (Date.now() > storedOtpData.expiresAt) {
            otpStore.delete(email.toLowerCase());
            return res.status(401).json({ error: "OTP expired" });
        }

        if (storedOtpData.otp !== otp) {
            return res.status(401).json({ error: "Invalid OTP" });
        }

        // OTP Valid!
        otpStore.delete(email.toLowerCase()); // Consume OTP
        return res.json(user);
    }

    // SCENARIO 2: Password Verification (Step 1)
    if (password) {
        // Simple password check (in production, use bcrypt)
        if (user.password !== password) {
             return res.status(401).json({ error: "Invalid password" });
        }

        // Check if user needs onboarding (First login)
        // If NO onboarding needed, return User directly (Skip OTP)
        if (!user.needsOnboarding) {
             return res.json(user);
        }

        // If Onboarding NEEDED -> Generate OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        otpStore.set(email.toLowerCase(), { otp: generatedOtp, expiresAt });

        console.log(`\n=== OTP GENERATED ===\nUser: ${email}\nOTP: ${generatedOtp}\n=====================\n`);

        // Send email via Resend
        try {
            await resend.emails.send({
                from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
                to: email,
                subject: 'Your StackleVest Login Code',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Login Verification</h2>
                        <p>Your one-time password is:</p>
                        <h1 style="background: #f4f4f5; padding: 20px; text-align: center; letter-spacing: 5px; border-radius: 8px;">${generatedOtp}</h1>
                        <p>This code will expire in 5 minutes.</p>
                    </div>
                `
            });
            console.log(`OTP email sent to ${email}`);
            return res.json({ requiresOtp: true, message: "OTP sent to email" });
        } catch (error) {
            console.error('Error sending OTP email:', error);
            // In dev/demo, we proceed even if email fails because we logged OTP to console
            return res.json({ requiresOtp: true, message: "OTP generated (check console)" });
        }
    }

    res.status(400).json({ error: "Missing credentials" });
});
// -----------------------------------

// Middleware for Socket.IO Authentication & Role Assignment
io.use((socket, next) => {
  const userEmail = socket.handshake.auth.email;
  
  if (!userEmail) {
    return next(new Error("Authentication error: No email provided"));
  }

  // Refresh users from DB to ensure latest data
  db = readDB();
  users = db.users;
  
  const user = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
  
  if (!user) {
    return next(new Error("Authentication error: User not found"));
  }

  // Attach user to socket session
  socket.user = user;
  next();
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

  // Send initial state
  const sendState = () => {
      socket.emit("history", messageHistory);
      socket.emit("channels", channels);
      socket.emit("users", users);
      socket.emit("tasks", tasks);
  };
  sendState();

  socket.on("request_refresh", () => {
      sendState();
  });

  socket.on("request_history", (payload) => {
    const { channelId, dmId } = payload;
    let history = [];
    if (channelId) {
      history = messageHistory.filter(m => m.channelId === channelId);
    } else if (dmId) {
      // In a real app, DM history is between two specific users
      // For now, we'll assume dmId is the "other" user's ID
      // and we want messages where (sender=me AND dmId=other) OR (sender=other AND dmId=me)
      history = messageHistory.filter(m => 
        (m.senderId === socket.user.id && m.dmId === dmId) || 
        (m.senderId === dmId && m.dmId === socket.user.id)
      );
    }
    socket.emit("history", history);
  });

  // Message Handler
  socket.on("message", (payload) => {
    try {
      // Basic validation
      if (!payload.content) return;

      const msg = {
        id: Date.now().toString(),
        content: payload.content,
        senderId: socket.user.id,
        timestamp: new Date().toISOString(),
        channelId: payload.channelId,
        dmId: payload.dmId,
        user: {
            id: socket.user.id,
            name: socket.user.name,
            avatar: socket.user.avatar
        }
      };

      messageHistory.push(msg);
      saveState(); // Persist to DB
      
      // In a real app, we would filter who receives this based on channel/DM
      io.emit("message", msg);
    } catch (e) {
      console.error("Error processing message:", e);
    }
  });

  // Reaction Handler
  socket.on("reaction", (payload) => {
    try {
      const { messageId, emoji } = payload;
      const msg = messageHistory.find(m => m.id === messageId);
      if (!msg) return;

      if (!msg.reactions) msg.reactions = [];
      
      const reactionIndex = msg.reactions.findIndex(r => r.emoji === emoji);
      const userId = socket.user.id;

      if (reactionIndex !== -1) {
        const reaction = msg.reactions[reactionIndex];
        const userIndex = reaction.userIds.indexOf(userId);
        if (userIndex !== -1) {
          // Remove reaction if user already reacted with this emoji
          reaction.userIds.splice(userIndex, 1);
          if (reaction.userIds.length === 0) {
            msg.reactions.splice(reactionIndex, 1);
          }
        } else {
          // Add user to existing reaction
          reaction.userIds.push(userId);
        }
      } else {
        // Create new reaction
        msg.reactions.push({ emoji, userIds: [userId] });
      }

      saveState();
      io.emit("message_updated", msg);
    } catch (e) {
      console.error("Error processing reaction:", e);
    }
  });

  // Delete Message Handler
  socket.on("delete_message", (payload) => {
    try {
      const { messageId } = payload;
      const index = messageHistory.findIndex(m => m.id === messageId);
      
      if (index !== -1) {
        const msg = messageHistory[index];
        
        // Only allow sender or admin to delete
        if (msg.senderId === socket.user.id || socket.user.role?.toLowerCase() === 'admin') {
          messageHistory.splice(index, 1);
          saveState();
          io.emit("message_deleted", { messageId });
        }
      }
    } catch (e) {
      console.error("Error deleting message:", e);
    }
  });

  // Update Status Handler
  socket.on("update_status", (payload) => {
    try {
      const { status } = payload;
      if (!["online", "busy", "offline"].includes(status)) return;

      db = readDB();
      const userIndex = db.users.findIndex(u => u.id === socket.user.id);
      if (userIndex !== -1) {
        db.users[userIndex].status = status;
        saveState();
        
        // Broadcast to all users
        io.emit("user_status_change", { userId: socket.user.id, status });
      }
    } catch (e) {
      console.error("Error updating status:", e);
    }
  });

  // Create Channel
  socket.on("create_channel", (payload) => {
    const newChannel = {
      id: Date.now().toString(),
      name: payload.name,
      description: payload.description,
      type: payload.type || "public",
      unreadCount: 0
    };

    channels.push(newChannel);
    saveState(); // Persist to DB
    io.emit("channel_created", newChannel);
  });

  // Delete Channel
  socket.on("delete_channel", (payload) => {
    const index = channels.findIndex(c => c.id === payload.channelId);
    if (index !== -1) {
      channels.splice(index, 1);
      saveState(); // Persist to DB
      io.emit("channel_deleted", { channelId: payload.channelId });
    }
  });

  // Task Management
  socket.on("create_task", (task) => {
    tasks.push(task);
    saveState();
    io.emit("task_created", task);
  });

  socket.on("update_task", (task) => {
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks[index] = task;
      saveState();
      io.emit("task_updated", task);
    }
  });

  // Delete Task Handler
  socket.on("delete_task", (payload) => {
    try {
      const taskId = typeof payload === 'string' ? payload : payload.taskId;
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
         // Allow creator to delete, or admin, or if task has no creatorId (legacy tasks)
         const isCreator = task.creatorId && task.creatorId === socket.user.id;
         const isAdmin = socket.user.role?.toLowerCase() === 'admin';
         const isLegacyTask = !task.creatorId;

         if (isCreator || isAdmin || isLegacyTask) {
           tasks = tasks.filter(t => t.id !== taskId);
           saveState();
           io.emit("task_deleted", taskId);
         }
       }
    } catch (e) {
      console.error("Error deleting task:", e);
    }
  });

  socket.on("add_task_comment", (data) => {
    const { taskId, content, userId } = data;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const newComment = {
        id: "c" + Date.now(),
        taskId,
        userId,
        content,
        createdAt: new Date().toISOString()
      };
      if (!tasks[taskIndex].comments) {
        tasks[taskIndex].comments = [];
      }
      tasks[taskIndex].comments.push(newComment);
      saveState();
      io.emit("refresh", { type: 'task_updated', payload: tasks[taskIndex] });
    }
  });

  socket.on("update_task_status", ({ taskId, status }) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === 'done') {
        task.completedAt = new Date().toISOString();
      } else {
        delete task.completedAt;
      }
      saveState();
      io.emit("task_updated", task);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.name}`);
    io.emit("user_status_change", { userId: socket.user.id, status: "offline" });
  });

  // Presence System
  socket.on("user_online", () => {
    io.emit("user_status_change", { userId: socket.user.id, status: "online" });
  });

  // Typing Indicators
  socket.on("typing_start", (payload) => {
    socket.broadcast.emit("typing_start", { 
      userId: socket.user.id, 
      channelId: payload.channelId,
      dmId: payload.dmId 
    });
  });

  socket.on("typing_stop", (payload) => {
    socket.broadcast.emit("typing_stop", { 
      userId: socket.user.id, 
      channelId: payload.channelId,
      dmId: payload.dmId 
    });
  });
});

app.post('/api/auth/change-password', (req, res) => {
    const { email, newPassword } = req.body;
    
    db = readDB();
    users = db.users;
    
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (index !== -1) {
        users[index].password = newPassword;
        users[index].needsOnboarding = false; // Turn off onboarding
        saveState();
        
        // Return updated user
        res.json(users[index]);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
