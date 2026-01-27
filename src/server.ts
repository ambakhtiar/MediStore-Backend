import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 5000;

async function server() {
    try {
        await prisma.$connect();
        console.log("Database Connected successfully !");

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        })
    } catch (e) {
        console.log("Error is:", e);
        await prisma.$disconnect();
        process.exit(1);
    }
}

server();