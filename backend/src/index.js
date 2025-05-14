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

// Middleware для логирования всех запросов
app.use((req, res, next) => {
  console.log(`Получен запрос: ${req.method} ${req.url}`);
  req.url = req.url.replace(/\/+/g, '/');
  console.log(`Нормализованный URL: ${req.url}`);
  next();
});

// Connect to MongoDB
connectDB();

// Debug: Log routes
console.log('Loading API routes...');
// console.log('API routes:', apiRoutes);
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

app.options('/api/login', cors({
  origin: (origin, callback) => {
    console.log('CORS preflight for /api/login from origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.post('/api/test-login', (req, res) => {
  console.log('Тестовый маршрут вызван');
  res.json({ message: 'Тестовый маршрут работает' });
});

// Catch-all маршрут для отладки
app.use((req, res) => {
  console.log(`Маршрут не найден для: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log('Forcing full redeployment at', new Date().toISOString());

const apiUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
const loginUrl = `${apiUrl}/api/login`;