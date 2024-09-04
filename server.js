require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cron = require('node-cron');
const dueDateService = require('./services/dueDateService');
const compression = require("compression");
const helmet = require("helmet");
const cluster = require("cluster");
const os = require("os");

// Import routes
const routes = require('./routes/index');
// const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(helmet());

// Use compression middleware to reduce the size of the response body
app.use(compression());

app.use(express.json());

// Middleware
// app.use(bodyParser.json());
app.use(passport.initialize());

// Passport config
require('./config/passport')(passport);

// Routes
app.use('/', routes);
// app.use('/api/tasks', taskRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
   .then(() => console.log('MongoDB connected'))
   .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
// Multi-process clustering using Node's 'cluster' module
if (cluster.isPrimary) {
   // Master process
   console.log(`Primary ${process.pid} is running`);
 
   // Fork workers for each CPU core
   const numCPUs = os.cpus().length;
   for (let i = 0; i < numCPUs; i++) {
     cluster.fork();
   }
 
   cluster.on("exit", (worker, code, signal) => {
     console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
     cluster.fork();
   });
 } else {
   // Worker processes handle requests
   app.listen(PORT, () => {
     console.log(`Worker ${process.pid} is listening on port ${PORT}`);
   });
 }
require('./services/dueDateService')