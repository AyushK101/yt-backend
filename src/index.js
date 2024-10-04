import dotenv from 'dotenv'
import connectDb from './db/index.js';
import { app } from './app.js';

// graceful dotenv error handling
import fs from 'fs';
const envFilePath = '.env';
const requiredEnvVars = ['MONGODB_URI','PORT'];
if (!fs.existsSync(envFilePath)) {
  console.error(`🚨 .env file not found at ${envFilePath}.`);
  // Handle missing file (e.g., provide default values or exit)
  process.exit(1);
}

try {
  dotenv.config();
} catch (error) {
  console.error('🚨 Error loading .env file:', error);
  // Handle loading error (e.g., provide default values or exit)
  process.exit(1);
}

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`🚨 Missing required environment variable: ${envVar}`);
    // Handle missing variable (e.g., provide default values or exit)
    process.exit(1);
  }
});


// as async func always return a promise
connectDb()
.then( response => {
    app.on("error",(error)=>{
        console.log("Uncaught error: ", error)
    })
    const server = app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
    console.log(server.address())
    server.on("error",(error)=>{
        console.log("Server error: ",error)
    })
})
.catch( err => console.log("🚨 DB connection failed: ",err))










/* inside index DB connection
 `;` helps to escape error if in above code ; is missing 
;(async ()=> {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("ERROR: ", error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`app is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("error",error)
        throw err
    }
})()

*/


