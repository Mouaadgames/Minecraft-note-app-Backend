import { Response, Request, NextFunction } from "express";
import { User } from "../Models/dbSchema/User";
import jwt from "jsonwebtoken";

function decodeJwt(jwtToken: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(jwtToken, "secret123", (err: any, decodedToken: any) => {
      if (err) {
        return reject("my error : " + err)
      }
      resolve(decodedToken.userId)
    })
  })
}

export default async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // if () return res.status(401).json({ error: "Unauthorized" })

  if (!req.body.jwt || req.body.jwt === "just a guest") return next()

  try {
    const decodedToken = await decodeJwt(req.body.jwt)
    if (await User.findById(decodedToken, { username: true }))
      return next()
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" })
  }

}
