import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"; 
import ServicesRouter from "./routes/service.routes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import PackageRouter from "./routes/packageRoutes.js";
import MembershipRouter from "./routes/membershipRoutes.js";
import transactionRouter from "./routes/transactionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import path from "path";
import subscriberRouter from "./routes/subscriberRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Database Connection
await connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Avenue Longevity Retreat Backend is running.");
});

// Mount Auth Routes
app.use("/api/auth", authRoutes); 
app.use("/api/services", ServicesRouter);
app.use("/api/bookings", bookingRoutes);
app.use("/api/packages", PackageRouter);
app.use("/api/memberships", MembershipRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/messages", messageRoutes);
app.use("/api/subscribers", subscriberRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/coupons", couponRoutes);

// Error Handling Middleware (Optional but good for production)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});