import express from "express"
import authRouter from "./Routers/authRouter"
import { connect as connectToDB } from "mongoose";
import cookieParser from "cookie-parser"
import graphqlRouter from "./Routers/graphqlRouter";


import { config } from "dotenv";
config()



import cors from "cors"
const dbURI = "mongodb://127.0.0.1:27017/MinecraftNotesDB"
const whitelist = ["http://localhost:5173", "http://localhost:3000"]
const app = express()
console.info("");
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin:
    (origin, callback) => {
      if (!origin) return callback(null, true)
      console.log(origin)
      if (whitelist.indexOf(origin) !== -1) return callback(null, true)

      callback(new Error("nah"))
    },
  credentials: true
}))

app.use(authRouter)
app.use(graphqlRouter)

app.get('/', (req, res) => {
  const userToken = req.body.jwt
  console.log(userToken)
  if (!userToken) return res.sendStatus(401)
  res.send("hello")
})


connectToDB(dbURI).then(() => {
  app.listen(3000, () => { console.info("listing at 3000") })
}).catch((err) => {
  console.error(err);
})