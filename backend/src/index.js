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
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());
connectDB();
app.use('/api', apiRoutes);

io.on('connection', (socket) => {
  socket.on('joinList', (uuid) => {
    socket.join(uuid);
    console.log(`Socket joined list: ${uuid}`);
  });
});

app.set('io', io);

app.use('/api/lists/:uuid', async (req, res, next) => {
  if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
    const list = await require('./models/ShoppingList').findOne({ uuid: req.params.uuid });
    if (list) {
      req.app.get('io').to(req.params.uuid).emit('listUpdate', list);
    }
  }
  next();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));