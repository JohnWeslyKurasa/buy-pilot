import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Buy Pilot API is running!" });
});

import authRoutes from "./routes/auth";
import wishlistRoutes from "./routes/wishlist";
import visionRoutes from "./routes/vision";
import searchRoutes from "./routes/search";
import analyzeRoutes from "./routes/analyze";
app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/vision", visionRoutes);
const url = "https://in.search.yahoo.com/search?p=site:amazon.in+HP+Laptop&fr=yfp-t";
app.use("/api/search", searchRoutes);
app.use("/api/analyze", analyzeRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
