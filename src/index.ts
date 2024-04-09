import express from "express";
import { chatRouter } from "./chat/index.js";
import { app } from "./app.js";
import cors from "cors";


const corsOptions = {
    origin: ["http://localhost:4200", "https://file-chatbot-frontend-csf37hag2a-ey.a.run.app"],
    optionsSuccessStatus: 204
}

export const registerRoutes = () => {
    app.options('*', cors(corsOptions));
    app.use(cors(corsOptions));
    
    
    app.use(express.json());
    
    app.use('/chat', chatRouter);
}

