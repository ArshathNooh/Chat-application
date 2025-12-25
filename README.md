# Real-Time Chat Web Application

A fully functional, responsive real-time web chat application built with Node.js, Express, Socket.IO, and vanilla JavaScript. Features modern UI with light/dark mode, room management, and real-time messaging.

## Features

- ✅ **User Authentication**: Unique username validation
- ✅ **Chat Rooms**: Create and join multiple chat rooms
- ✅ **Real-Time Messaging**: Instant message delivery using WebSockets
- ✅ **Message Formatting**: Support for **bold**, *italic*, and clickable links
- ✅ **Light/Dark Mode**: Toggle between themes with persistent preference
- ✅ **Responsive Design**: Mobile-first design that works on all devices
- ✅ **Modern UI**: Clean, WhatsApp/Telegram-inspired interface
- ✅ **User Management**: See who's in each room, join/leave notifications
- ✅ **Input Validation**: Sanitized inputs and secure message handling

## Tech Stack

- **Frontend**: HTML5, CSS3 (Custom with CSS Variables), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Real-Time**: Socket.IO
- **Storage**: In-memory (can be extended to MongoDB)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup Steps

1. **Navigate to the project directory:**
   ```bash
   cd "chat application"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
chat application/
├── server/
│   └── index.js          # Express server and Socket.IO setup
├── client/
│   ├── index.html        # Main HTML structure
│   ├── style.css         # Styling with light/dark theme
│   └── app.js            # Frontend JavaScript logic
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Usage

1. **Login**: Enter a unique username (2-20 characters, alphanumeric and underscores only)
2. **Select/Create Room**: Choose an existing room or create a new one
3. **Chat**: Type messages and press Enter or click Send
4. **Formatting**: 
   - Use `**text**` for **bold**
   - Use `*text*` for *italic*
   - Paste URLs to make them clickable
5. **Theme**: Toggle light/dark mode using the moon/sun icon
6. **Mobile**: Use the menu button (☰) to access the sidebar on mobile devices

## Features in Detail

### User Authentication
- Username must be 2-20 characters
- Only letters, numbers, and underscores allowed
- Duplicate usernames are prevented
- Username is displayed in the sidebar

### Chat Rooms
- Default room: "general"
- Create custom rooms with unique names
- Join any available room
- See active room highlighted in the sidebar
- View user count for current room

### Messaging
- Real-time message delivery
- Messages show sender name and timestamp
- Auto-scroll to newest message
- Empty messages are prevented
- Messages are sanitized for security

### UI/UX
- **Desktop**: Sidebar on left, chat area on right
- **Mobile**: Collapsible sidebar, full-screen chat
- Smooth animations and transitions
- Empty states for better UX
- System messages for user join/leave events

### Security
- Input sanitization (max 200 characters per message)
- XSS prevention through HTML escaping
- Username validation
- Room name validation

## Customization

### Change Port
Edit `server/index.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your preferred port
```

### Add MongoDB Persistence
To add database persistence, you can:
1. Install MongoDB and mongoose
2. Create models for users, rooms, and messages
3. Update server/index.js to use database instead of in-memory storage

### Customize Colors
Edit CSS variables in `client/style.css`:
```css
:root {
  --accent-primary: #007bff; /* Change to your brand color */
  /* ... other variables */
}
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, set a different port:
```bash
PORT=3001 npm start
```

### Socket.IO Connection Issues
- Ensure the server is running
- Check browser console for errors
- Verify firewall settings allow WebSocket connections

### Username Already Taken
The app prevents duplicate usernames. If you see this error:
- Try a different username
- Wait a moment if you just disconnected (username is released on disconnect)

## Future Enhancements

Potential features to add:
- [ ] User avatars/profile pictures
- [ ] Private/DM messaging
- [ ] File/image sharing
- [ ] Message reactions/emojis
- [ ] Typing indicators
- [ ] Message search
- [ ] Message history persistence (MongoDB)
- [ ] User authentication with passwords
- [ ] Room passwords/private rooms
- [ ] Admin controls

## License

MIT License - feel free to use this project for learning or as a base for your own applications.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

**Enjoy chatting!** 💬


