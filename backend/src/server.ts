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
import axios from "axios";

app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/vision", visionRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/analyze", analyzeRoutes);

app.get("/api/diagnose", async (req, res) => {
  try {
     const url = "https://search.yahoo.com/search?p=site:amazon.in+laptop&fr=yfp-t";
     const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 10000
     });
     
     const cheerio = require('cheerio');
     const $ = cheerio.load(response.data);
     const samples: any[] = [];
     
     $('.algo-sr').slice(0, 4).each((i: number, el: any) => {
       const titleEl = $(el).find('.compTitle a');
       const title = titleEl.text();
       const snippet = $(el).find('.compTitle').next().text() || $(el).find('.fc-falcon').text() || "";
       samples.push({ title, snippet });
     });

     return res.json({ 
        success: true, 
        status: response.status, 
        samples
     });
  } catch(e: any) {
     return res.json({ success: false, error: e.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
