import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { notFound } from "./middleware/notFound";
import errorHandler from "./middleware/globalErrorHandler";

const app: Application = express();
// app.use(cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true,
// }));

// Configure CORS to allow both production and Vercel preview deployments
const allowedOrigins = [
    process.env.APP_URL || "http://localhost:3000",
    process.env.PROD_APP_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            // Check if origin is in allowedOrigins or matches Vercel preview pattern
            const isAllowed =
                allowedOrigins.includes(origin) ||
                /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
                /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
        exposedHeaders: ["Set-Cookie"],
    }),
);


app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());


app.use('/api', router)

app.get('/', (req: Request, res: Response) => {
    res.send("Hello World!")
})

app.use(notFound);
app.use(errorHandler);

export default app;
