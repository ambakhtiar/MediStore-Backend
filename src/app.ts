import express, { Application, Request, Response } from "express";
import cors from "cors";
import { medicineRouter } from "./modules/medicine/medicine.route";

const app: Application = express();

app.use(express.json());
app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true
}))

app.use("/medicines", medicineRouter)

app.get('/', (req: Request, res: Response) => {
    res.send("Hello World!")
})

export default app;
