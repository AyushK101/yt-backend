import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { ApiError } from './utils/ApiError.js'

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

app.use(cookieParser())


//routes
import userRouter from './routes/user.routes.js'
//routes declaration
app.use("/api/v1/users", userRouter)


app.use((err, req, res, next) => {
    // Check if it's an instance of your custom ApiError
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            stack: process.env.NODE_ENV === 'production' ? undefined : err.stack, // Optionally hide stack in production
        });
    }

    // For any other unexpected errors
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
});


export { app }

