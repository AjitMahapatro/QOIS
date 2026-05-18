// config/db.js

import mongoose from 'mongoose'; // <-- CRITICAL FIX: Use import instead of require()

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`\n\tMongoDB Atlas Connected: ${conn.connection.host}\n`);

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB; // <-- CRITICAL FIX: Use export default to match the import in server.js