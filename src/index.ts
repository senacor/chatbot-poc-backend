import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { chatRouter } from "./chat/index.js";

const app = express();
const port = process.env["PORT"] || 3000;


const corsOptions = {
    origin: ["http://localhost:4200", "https://chatbot-frontend-csf37hag2a-ey.a.run.app"],
    optionsSuccessStatus: 204
}

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

app.use('/chat', chatRouter);
app.get("/", (_: Request, response: Response) => {
    response.status(200).json({message: "Hello World, running in Container"});
})

app.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`);
})
