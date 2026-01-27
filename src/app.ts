import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app: Application = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());


app.use('/api', router)

app.get('/', (req: Request, res: Response) => {
    res.send("Hello World!")
})

export default app;
