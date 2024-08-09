import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import router from "./router";
import dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT || 4000;
dotenv.config();

app.use(session({
    secret: process.env.SESS_SECRET!,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        secure: 'auto',
        maxAge: 180 * 60 * 1000
    }
}));
app.use(cors({
    credentials: true,
    origin: [
      'http://localhost:3006',
      'https://sodiqardianto.com/'
    ]
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: 'draft-6',
  message: 'Too many requests from this IP, please try again after 15 minutes'
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));

app.use("/api", router());
export default app;