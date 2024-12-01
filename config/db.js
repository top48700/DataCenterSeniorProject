const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Project-S", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Add other connection options if needed (e.g., poolSize, retryWrites)
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Handle connection error gracefully (e.g., retry, log, exit)
    process.exit(1); // Exit the application if connection fails 
  }
};

module.exports = dbConnection;