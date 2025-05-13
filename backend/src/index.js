const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://shop-smart-git-main-galym7707s-projects.vercel.app', 'https://shop-smart-one.vercel.app'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// CORS for Express (support multiple origins)
const allowedOrigins = ['https://shop-smart-git-main-galym7707s-projects.vercel.app', 'https://shop-smart-one.vercel.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());

// Connect to MongoDB
connectDB();
console.log('API routes loaded:', apiRoutes);
// Mount API routes
app.use('/api', apiRoutes);

// Set io for use in routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  socket.on('joinList', (uuid) => {
    socket.join(uuid);
    console.log(`Socket joined list: ${uuid}`);
  });
});

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ShopSmart Backend is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
