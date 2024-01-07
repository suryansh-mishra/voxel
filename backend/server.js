const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });

const express = require('express');
const chalk = require('chalk');
const app = require('./app');
const mongoose = require('mongoose');
const server = require('http').Server(app);
const socketHandler = require('./services/socketHandler');

const io = require('socket.io')(server, {
  cors: {
    origin: [process.env.WEB_CLIENT],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const decodeJWT = require('./utils/decodeJWT');

app.set('sockets', io);

const DB = process.env.DATABASE_LOCAL.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {})
  .then(() => console.log(chalk.bgBlueBright(`DB connection successful`)))
  .catch((err) => {
    console.log(chalk.red('Database Connection Error'));
    if (process.env.NODE_ENV === 'dev') console.log(err);
    else process.exit(0);
  });

const User = require('./models/userModel');

io.use(async (socket, next) => {
  console.log('Socket middleware used');
  const cookies = socket.handshake?.headers?.cookie;
  let token;
  console.log(cookies);
  cookies?.split(';').forEach((element) => {
    element = element.trim();
    if (element.startsWith('jwt=')) {
      token = element.substring(4);
      return;
    }
  });
  if (!token) return;
  const decoded = decodeJWT(token);
  const user = await User.findById(decoded.id);
  if (decoded.id && user) {
    socket.userId = decoded.id;
    socket.userEmail = user.email;
    socket.firstName = user.firstName;
    next();
  } else next(new Error('Authentication error'));
});

io.on('connection', (socket) => socketHandler(io, socket));

const port = process.env.PORT || 49152;
server.listen(port, () => {
  console.log(
    chalk.whiteBright.bold.bgGreen(
      `\n\n\n\n⫸  Server is listening on ${port}   `
    )
  );
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(reason);
  console.log(chalk.bgRedBright('Exiting because of unhandled exception'));
  process.exit(1);
});
