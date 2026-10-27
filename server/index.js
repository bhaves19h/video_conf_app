import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import {Server} from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import roomHandler from './socket/roomHandler.js';

import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(cors());

app.use('/auth', authRoutes);

app.get('/health',(req,res)=>{
    res.json({message:"ok"})
})

// Serve the React build (frontend + backend on one service)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuild = path.join(__dirname, '../client/build');
app.use(express.static(clientBuild));
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

io.on("connection", (socket) =>{
    console.log("User connected");

    roomHandler(socket);

    socket.on('disconnect', ()=>{
        console.log("user disconnected");
    })

})

const PORT = process.env.PORT || 6001;

if (!process.env.MONGO_URI) console.error("MONGO_URI is not set");
if (!process.env.JWT_SECRET) console.error("JWT_SECRET is not set");

mongoose.connect(process.env.MONGO_URI).then(() => {
    server.listen(PORT, () => {
        console.log(`Running @ ${PORT}`);
    });
}).catch((err) => {
    console.log("Error: ", err);
    process.exit(1);
});
