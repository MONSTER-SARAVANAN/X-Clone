import mongoose from "mongoose";

const connectDB = async ()=> {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Mongodb Connect");
    } catch (error) {
        console.log(`Error in connecting to database: ${error.message}`);
        process.exit(1)
    }
}
export default connectDB;