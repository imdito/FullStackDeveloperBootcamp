import express from "express";
import cors from "cors";
import adminRouter from "./routes/admin.router.js";
import { MErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(MErrorHandler);
app.use("/auth", adminRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});