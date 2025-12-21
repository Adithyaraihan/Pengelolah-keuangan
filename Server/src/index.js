import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import prisma from "./database/prisma.js";
import authRoutes from "./modules/auth/auth.route.js";
import transactionRoutes from "./modules/transaction/transaction.route.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api/transaction", transactionRoutes);

async function starServer() {
  try {
    console.log("Connecting to database...");

    await prisma.$connect();

    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect database");
    console.error(error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("🛑 Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

starServer();
