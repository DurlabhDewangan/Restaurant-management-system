import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {

  const server = app.listen(PORT, () => {
      console.log(` Server is running at port: ${PORT}`);
    });

    server.on("error", (error) => {
      console.error(" Server error:", error);
      throw error;
    });
  }).catch((err)=>{
    console.log("database connection failed", err);
  }) 