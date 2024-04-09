import express from "express"
import authRouter from "./Routers/authRouter"
import { connect as connectToDB } from "mongoose";
import cookieParser from "cookie-parser"
import graphqlRouter from "./Routers/graphqlRouter";


import { config } from "dotenv";
config()


import cors from "cors"
import path from "path";
const dbURI = "mongodb://127.0.0.1:27017/MinecraftNotesDB"
const whitelist = ["http://localhost:5174", "http://localhost:3000"]
const app = express()
console.info("");
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin:
    (origin, callback) => {
      if (!origin) return callback(null, true)
      console.log("origin", origin)
      if (whitelist.indexOf(origin) === -1) return callback(new Error("nah")) 
      callback(null, true)
    },
  credentials: true
}))

app.use(authRouter)
app.use(graphqlRouter)
app.use("^/$", (req, res) => {
  console.log(req.path)
  res.redirect("/login")
})
app.use(express.static(path.resolve(__dirname, "./build")))

app.get("*", (req, res) => {
  console.log(req.path);
  console.log(path.resolve(__dirname, "./build/index.html"));

  res.sendFile(path.resolve(__dirname, "./build/index.html"))
})


connectToDB(dbURI).then(() => {
  app.listen(3000, () => { console.info("listing at 3000") })
}).catch((err) => {
  console.error(err);
})