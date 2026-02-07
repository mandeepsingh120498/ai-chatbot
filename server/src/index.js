import "dotenv/config";
import express from "express";
import cors from "cors";
import { chatRouter } from "./routes/chatRoutes.js";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", chatRouter);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
