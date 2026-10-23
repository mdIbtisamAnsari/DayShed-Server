import connectDB from "./db/index.js";
import { app } from "./app.js";
// import { redis } from "./app.js";

// async function main() {
//   const reply =  await redis.ping();
//   console.log("Redis connected", reply)
// }

// main()
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, '0.0.0.0', () => {
      console.log(`surver is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("Error Connecting DataBase", err);
  });


