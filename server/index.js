const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// In-memory storage
const users = new Map(); // socketId -> { username, room }
const rooms = new Set(['general']); // Available rooms
const roomUsers = new Map(); // room -> Set of usernames

// Helper function to sanitize input
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 200); // Max 200 characters
}

// Helper function to validate username
function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  const sanitized = sanitizeInput(username);
  return sanitized.length >= 2 && sanitized.length <= 20 && /^[a-zA-Z0-9_]+$/.test(sanitized);
}

// Check if username is already taken
function isUsernameTaken(username) {
  for (const user of users.values()) {
    if (user.username.toLowerCase() === username.toLowerCase()) {
      return true;
    }
  }
  return false;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user login
  socket.on('login', (data, callback) => {
    const username = sanitizeInput(data.username);
    
    if (!isValidUsername(username)) {
      return callback({ success: false, error: 'Username must be 2-20 characters and contain only letters, numbers, and underscores' });
    }
    
    if (isUsernameTaken(username)) {
      return callback({ success: false, error: 'Username is already taken' });
    }

    users.set(socket.id, { username, room: null });
    callback({ success: true, username, rooms: Array.from(rooms) });
  });

  // Handle joining a room
  socket.on('joinRoom', (data, callback) => {
    const user = users.get(socket.id);
    if (!user) {
      return callback({ success: false, error: 'Please login first' });
    }

    const roomName = sanitizeInput(data.room);
    if (!roomName || roomName.length < 1 || roomName.length > 30) {
      return callback({ success: false, error: 'Room name must be 1-30 characters' });
    }

    // Leave previous room if any
    if (user.room) {
      socket.leave(user.room);
      const prevRoomUsers = roomUsers.get(user.room);
      if (prevRoomUsers) {
        prevRoomUsers.delete(user.username);
        if (prevRoomUsers.size === 0) {
          roomUsers.delete(user.room);
        }
        io.to(user.room).emit('userLeft', { username: user.username });
      }
    }

    // Join new room
    if (!rooms.has(roomName)) {
      rooms.add(roomName);
    }

    socket.join(roomName);
    user.room = roomName;

    if (!roomUsers.has(roomName)) {
      roomUsers.set(roomName, new Set());
    }
    roomUsers.get(roomName).add(user.username);

    // Get users in room
    const usersInRoom = Array.from(roomUsers.get(roomName));

    callback({ 
      success: true, 
      room: roomName,
      users: usersInRoom,
      rooms: Array.from(rooms)
    });

    // Notify others in the room
    socket.to(roomName).emit('userJoined', { username: user.username });
  });

  // Handle creating a new room
  socket.on('createRoom', (data, callback) => {
    const user = users.get(socket.id);
    if (!user) {
      return callback({ success: false, error: 'Please login first' });
    }

    const roomName = sanitizeInput(data.room);
    if (!isValidUsername(roomName)) {
      return callback({ success: false, error: 'Room name must be 2-20 characters and contain only letters, numbers, and underscores' });
    }

    if (rooms.has(roomName)) {
      return callback({ success: false, error: 'Room already exists' });
    }

    rooms.add(roomName);
    callback({ success: true, room: roomName, rooms: Array.from(rooms) });
  });

  // Handle sending messages
  socket.on('sendMessage', (data, callback) => {
    const user = users.get(socket.id);
    if (!user || !user.room) {
      return callback({ success: false, error: 'You must be in a room to send messages' });
    }

    const message = sanitizeInput(data.message);
    if (!message || message.length === 0) {
      return callback({ success: false, error: 'Message cannot be empty' });
    }

    const messageData = {
      username: user.username,
      message: message,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all users in the room
    io.to(user.room).emit('newMessage', messageData);
    callback({ success: true });
  });

  // Handle getting room list
  socket.on('getRooms', (callback) => {
    callback({ rooms: Array.from(rooms) });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      if (user.room) {
        const roomUsersSet = roomUsers.get(user.room);
        if (roomUsersSet) {
          roomUsersSet.delete(user.username);
          if (roomUsersSet.size === 0) {
            roomUsers.delete(user.room);
          }
          socket.to(user.room).emit('userLeft', { username: user.username });
        }
      }
      users.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


