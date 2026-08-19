import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL);

        console.log("MongoDB connected");
        console.log(`MongoDB host: ${connection.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:");
        console.error(error.message);

        process.exit(1);
    }
};

export default connectDb;