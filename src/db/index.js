import mongoose from "mongoose" 
import { DB_NAME } from "../constants.js" 


const connectDb = async ()=> {
    try {
        const connectionResponse = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n mongodb connected !! DB HOST : ${connectionResponse.connection.host}`)
    } catch (error) {
        console.log("MONGO_DB CONNECTION FAILED: ", error)
        process.exit(1)
    }
}


export default connectDb