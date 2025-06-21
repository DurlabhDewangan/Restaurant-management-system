import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js";


dotenv.config({ path: "./env" })

connectDB()
    .then(() => {

        const PORT = process.env.PORT || 8000;

        const server = app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });

        server.on("error", (error) => {
            console.log("ERR : ", error
            );
            throw error
        })

    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })