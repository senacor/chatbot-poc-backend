import "dotenv/config";
import express from "express";
import { registerRoutes } from "./index.js";

const app = express();
const port = process.env["PORT"] || 3000;

app.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`);
    registerRoutes();
})


export { app };