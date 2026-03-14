import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chatRouter } from "./routes/chatRoutes.js";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", chatRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");
const hasBuiltClient = fs.existsSync(clientIndexPath);

if (hasBuiltClient) {
  app.use(express.static(clientDistPath));
  app.get("*", (_req, res) => {
    res.sendFile(clientIndexPath);
  });
} else {
  app.get("/", (_req, res) => {
    res.status(200).json({
      status: "ok",
      message:
        "Backend is running. Start the UI with `npm run dev` and open http://localhost:5173."
    });
  });
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
