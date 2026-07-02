import express from "express";
import cakesRouter from "./routes/cakes.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());
app.use("/api/cakes", cakesRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Kuchometer API listening on port ${port}`);
});
