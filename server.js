const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Starts empty: scores are created by real players instead of demo/default entries.
const leaderboard = [];
const onlineUsers = new Map();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/leaderboard', (req, res) => {
  res.json([...leaderboard].sort((a, b) => b.score - a.score).slice(0, 100));
});

function safeProfile(data = {}) {
  const name = String(data.name || 'Player').trim().slice(0, 24) || 'Player';
  let avatar = String(data.avatar || '').slice(0, 1500000);
  // Only accept image data URLs for the profile image.
  if (avatar && !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(avatar)) avatar = '';
  return { name, avatar };
}

function broadcastLeaderboard() {
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard.splice(100);
  io.emit('leaderboard', leaderboard);
}

io.on('connection', socket => {
  socket.emit('leaderboard', [...leaderboard]);
  socket.emit('onlineCount', onlineUsers.size);

  socket.on('identify', data => {
    const user = safeProfile(data);
    onlineUsers.set(socket.id, user);
    io.emit('onlineCount', onlineUsers.size);
  });

  socket.on('submitScore', data => {
    const user = safeProfile(data);
    const score = Math.max(0, Math.floor(Number(data?.score) || 0));
    if (!score) return;

    const existing = leaderboard.find(x => x.name.toLowerCase() === user.name.toLowerCase());
    if (existing) {
      if (score > existing.score) {
        existing.score = score;
        existing.avatar = user.avatar;
      } else if (user.avatar) {
        existing.avatar = user.avatar;
      }
    } else {
      leaderboard.push({ name: user.name, score, avatar: user.avatar });
    }
    broadcastLeaderboard();
  });

  socket.on('chat', data => {
    const user = onlineUsers.get(socket.id) || { name: 'Player', avatar: '' };
    const message = String(data?.message || '').trim().slice(0, 240);
    if (!message) return;
    io.emit('chat', {
      name: user.name,
      avatar: user.avatar,
      message,
      time: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('onlineCount', onlineUsers.size);
  });
});


app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(PORT, () => console.log(`Dino World running at http://localhost:${PORT}`));
