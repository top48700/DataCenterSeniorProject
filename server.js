const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const MongoStore = require('connect-mongo');
const http = require('http');
const socketIO = require('socket.io');
const dbConnection = require('./config/db');
const createAdmin = require('./config/createadmin');

// Import only once
const userRoutes = require('./Schema/Schema_Setting_user/routes/userRoutes');
const VerifyRoutes = require('./Schema/Schema_Setting_Verification/routes/verifyRoutes');
const ocrRoutes = require('./Schema/Schema_Setting_ocrResult/routes/ocrRoutes');
const profileRoutes = require('./Schema/Schema_Setting_profile/routes/ProfileRoutes');
const ensureVerified = require('./config/ensureVerified');
const verifyRoute = require('./Schema/Schema_Setting_Verification/routes/verifyRoute');
const User = require('./Schema/Schema_Setting_user/models/userModel')
const adminRoutes = require('./Schema/Schema_setting_admin/routes/adminroute');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Store io instance in app locals for access in controllers
app.locals.io = io;

// Call the dbConnection function to establish the connection
dbConnection().then(() => {
    console.log('Database connected successfully');
    createAdmin();  // เรียกใช้ createAdmin หลังจากเชื่อมต่อฐานข้อมูลสำเร็จ
}).catch(err => {
    console.error('Error connecting to database:', err);
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many requests from this IP, please try again later.'
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/request-otp', limiter);

const sessionMiddleware = session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/Project-S" }),
    cookie: { secure: false } 
});

app.use(sessionMiddleware);
app.use((req, res, next) => {
    console.log("Session ID:", req.sessionID);
    console.log("User ID in session:", req.session.userID);
    next();
});
app.use('/login', userRoutes);
app.use(express.static(path.join(__dirname, "public")));

// Use session middleware with Socket.IO
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

app.get("/", (req, res) => { res.render("index"); });

// Use correct routes
app.use('/', userRoutes);
app.use('/', VerifyRoutes);
app.use('/', ocrRoutes);
app.use('/', profileRoutes);
app.use('/admin', adminRoutes);


// Use the verification middleware for protected routes
app.use('/dashboard', ensureVerified);

// Add the verify route
app.use('/', verifyRoute);

const activeSessions = {}; // To track active sessions

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('registerSession', (userId) => {
        if (activeSessions[userId]) {
            // Emit forcedLogout to the previous session
            io.to(activeSessions[userId]).emit('forcedLogout', 'You have been logged out due to another login.');
        }
        activeSessions[userId] = socket.id;
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove disconnected socket from activeSessions
        for (let userId in activeSessions) {
            if (activeSessions[userId] === socket.id) {
                delete activeSessions[userId];
                break;
            }
        }
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).send("Internal Server Error");
});
