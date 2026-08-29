import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/omnisight';
  try {
    const connectionInstance = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected! Host: ${connectionInstance.connection.host}`);
    return connectionInstance;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export default connectDB;
