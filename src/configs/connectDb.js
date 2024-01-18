import mongoose from "mongoose";

const connectMongoDb = async (DB_URL) =>{
    try {
        const DB_OPTIONS = {
            dbName: 'BasicNodeJwtAuth'
        }
        await mongoose.connect(DB_URL, DB_OPTIONS);
        console.log('Connected...');
    } catch (error) {
        console.log(error);
    }
}

export default connectMongoDb;