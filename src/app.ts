import express from "express";
import cors from "cors";
import adminRouter from "./routes/admin.router.js";
import { MErrorHandler } from "./middlewares/error.middleware.js";
import { connect } from "http2";
import { connectRedis } from "./configs/redis.config.js";

const app = express();
const PORT = 3000;

connectRedis();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(MErrorHandler);
app.get('/api/v1', (req, res) => {
  res.json({ message: 'Welcome to Admin Management API v1' });
});

// [FIX] Gunakan router untuk semua request yang masuk ke /api/v1/auth
app.use('/api/v1/auth', adminRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running and ready on http://localhost:${PORT}`);
});

