// Socket.IO connection
const socket = io();

// State management
let currentUser = null;
let currentRoom = null;
let rooms = [];
let theme = localStorage.getItem('theme') || 'light';

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const loginError = document.getElementById('loginError');
const currentUsername = document.getElementById('currentUsername');
const currentRoomName = document.getElementById('currentRoomName');
const roomUserCount = document.getElementById('roomUserCount');
const roomsList = document.getElementById('roomsList');
const messagesList = document.getElementById('messagesList');
const messagesContainer = document.getElementById('messagesContainer');
const emptyState = document.getElementById('emptyState');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const createRoomBtn = document.getElementById('createRoomBtn');
const createRoomModal = document.getElementById('createRoomModal');
const createRoomForm = document.getElementById('createRoomForm');
const newRoomName = document.getElementById('newRoomName');
const createRoomError = document.getElementById('createRoomError');
const closeCreateRoomModal = document.getElementById('closeCreateRoomModal');
const cancelCreateRoom = document.getElementById('cancelCreateRoom');
const logoutBtn = document.getElementById('logoutBtn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

// Initialize theme
document.documentElement.setAttribute('data-theme', theme);
updateThemeIcon();

// Theme toggle
themeToggle.addEventListener('click', () => {
  theme = theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon();
});

function updateThemeIcon() {
  themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Sidebar toggle for mobile
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  }
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  
  if (username.length < 2) {
    showError(loginError, 'Username must be at least 2 characters');
    return;
  }

  socket.emit('login', { username }, (response) => {
    if (response.success) {
      currentUser = response.username;
      rooms = response.rooms;
      loginScreen.classList.remove('active');
      chatScreen.classList.add('active');
      currentUsername.textContent = currentUser;
      updateRoomsList();
      loadRooms();
    } else {
      showError(loginError, response.error);
    }
  });
});

// Logout
logoutBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    socket.disconnect();
    socket.connect();
    currentUser = null;
    currentRoom = null;
    rooms = [];
    messagesList.innerHTML = '';
    messageInput.disabled = true;
    sendBtn.disabled = true;
    currentRoomName.textContent = 'Select a room';
    roomUserCount.textContent = '';
    chatScreen.classList.remove('active');
    loginScreen.classList.add('active');
    usernameInput.value = '';
    loginError.textContent = '';
  }
});

// Create room button
createRoomBtn.addEventListener('click', () => {
  createRoomModal.classList.add('active');
  newRoomName.focus();
});

// Close create room modal
closeCreateRoomModal.addEventListener('click', () => {
  createRoomModal.classList.remove('active');
  createRoomForm.reset();
  createRoomError.textContent = '';
});

cancelCreateRoom.addEventListener('click', () => {
  createRoomModal.classList.remove('active');
  createRoomForm.reset();
  createRoomError.textContent = '';
});

// Create room form submission
createRoomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const roomName = newRoomName.value.trim();
  
  socket.emit('createRoom', { room: roomName }, (response) => {
    if (response.success) {
      rooms = response.rooms;
      updateRoomsList();
      createRoomModal.classList.remove('active');
      createRoomForm.reset();
      createRoomError.textContent = '';
      // Auto-join the newly created room
      joinRoom(roomName);
    } else {
      showError(createRoomError, response.error);
    }
  });
});

// Join room function
function joinRoom(roomName) {
  if (currentRoom === roomName) return;
  
  socket.emit('joinRoom', { room: roomName }, (response) => {
    if (response.success) {
      currentRoom = response.room;
      rooms = response.rooms;
      currentRoomName.textContent = currentRoom;
      roomUserCount.textContent = `${response.users.length} user${response.users.length !== 1 ? 's' : ''}`;
      messagesList.innerHTML = '';
      emptyState.classList.add('hidden');
      messageInput.disabled = false;
      sendBtn.disabled = false;
      messageInput.focus();
      updateRoomsList();
    }
  });
}

// Update rooms list
function updateRoomsList() {
  roomsList.innerHTML = '';
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.className = `room-item ${room === currentRoom ? 'active' : ''}`;
    li.textContent = room;
    li.addEventListener('click', () => joinRoom(room));
    roomsList.appendChild(li);
  });
}

// Load rooms from server
function loadRooms() {
  socket.emit('getRooms', (response) => {
    rooms = response.rooms;
    updateRoomsList();
  });
}

// Send message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || !currentRoom) return;

  socket.emit('sendMessage', { message }, (response) => {
    if (response.success) {
      messageInput.value = '';
    } else {
      alert(response.error);
    }
  });
}

// Format message text (bold, italic, links)
function formatMessage(text) {
  // Escape HTML to prevent XSS
  let formatted = escapeHtml(text);
  
  // Convert **bold** to <strong>bold</strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>italic</em> (but not if it's part of **)
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  
  // Convert URLs to links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return formatted;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Display message
function displayMessage(data, isSent = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  const content = document.createElement('div');
  content.className = 'message-content';
  content.innerHTML = formatMessage(data.message);
  
  const info = document.createElement('div');
  info.className = 'message-info';
  
  const username = document.createElement('span');
  username.textContent = data.username;
  username.style.fontWeight = '600';
  
  const timestamp = document.createElement('span');
  timestamp.textContent = formatTimestamp(data.timestamp);
  
  info.appendChild(username);
  info.appendChild(timestamp);
  
  bubble.appendChild(content);
  messageDiv.appendChild(bubble);
  messageDiv.appendChild(info);
  
  messagesList.appendChild(messageDiv);
  emptyState.classList.add('hidden');
  scrollToBottom();
}

// Display system message
function displaySystemMessage(text) {
  const systemDiv = document.createElement('div');
  systemDiv.className = 'system-message';
  systemDiv.textContent = text;
  messagesList.appendChild(systemDiv);
  scrollToBottom();
}

// Format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) { // Less than 1 minute
    return 'just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else if (diff < 86400000) { // Less than 1 day
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
}

// Scroll to bottom
function scrollToBottom() {
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
}

// Show error message
function showError(element, message) {
  element.textContent = message;
  setTimeout(() => {
    element.textContent = '';
  }, 5000);
}

// Socket event listeners
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  displaySystemMessage('Connection lost. Attempting to reconnect...');
});

socket.on('newMessage', (data) => {
  const isSent = data.username === currentUser;
  displayMessage(data, isSent);
});

socket.on('userJoined', (data) => {
  if (data.username !== currentUser) {
    displaySystemMessage(`${data.username} joined the room`);
  }
});

socket.on('userLeft', (data) => {
  if (data.username !== currentUser) {
    displaySystemMessage(`${data.username} left the room`);
  }
});

// Focus username input on load
usernameInput.focus();

