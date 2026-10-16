import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`surver is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error Connecting DataBase", err);
  });
