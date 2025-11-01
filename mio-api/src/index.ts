import express, { json } from "express";
import { PORT } from "./config/environment";
import { setupAdmin } from "./setup/admin";
import cors from "cors";
import authRoutes from "./routes/auth";
import { errorHandler } from "./middlewares/errorHandler";
import transferRoutes from "./routes/transfer";

const app = express();
app.use(json());
app.use(cors());

setupAdmin();

app.get("/", (_req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRoutes);
app.use("/savings", transferRoutes)

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
