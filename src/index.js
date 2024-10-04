import dotenv from 'dotenv'
import express from 'express'
import connectDb from './db/index.js';


// graceful dotenv error handling
import fs from 'fs';
const envFilePath = '.env';
const requiredEnvVars = ['MONGODB_URI','PORT'];
if (!fs.existsSync(envFilePath)) {
  console.error(`.env file not found at ${envFilePath}.`);
  // Handle missing file (e.g., provide default values or exit)
  process.exit(1);
}

try {
  dotenv.config();
} catch (error) {
  console.error('Error loading .env file:', error);
  // Handle loading error (e.g., provide default values or exit)
  process.exit(1);
}

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    // Handle missing variable (e.g., provide default values or exit)
    process.exit(1);
  }
});
//


connectDb()



const app = express()




/*
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


