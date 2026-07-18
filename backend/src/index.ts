import express from "express";
import cakesRouter from "./routes/cakes.js";
import authRouter from "./routes/auth.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.set("trust proxy", true);

app.use(express.json());
app.use("/api/cakes", cakesRouter);
app.use("/api/auth", authRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Kuchometer API listening on port ${port}`);
});
