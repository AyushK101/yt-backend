import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

//allowing cors+config
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
    allowedHeaders: true,
    
}))

//accepting json + data accepting limit
app.use(express.json({
    limit: "16kb",
    strict: true,

}))

//URL configuration
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

//store user static data; folder->public
app.use(express.static("public"))

app.use(cookieParser({}))


//routes
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter)


export { app }

