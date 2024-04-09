import { Request, Response } from "express";
import { graphqlHTTP } from "express-graphql";
import { executableSchema } from "../Models/graphql/schema"
import jwt from "jsonwebtoken";

function decodeJwt(jwtToken: string) {
  return new Promise((resolve, reject) => {
    if (jwtToken === "just a guest" || !jwtToken) {
      return resolve("64eda1cfd2d369da64f6adc4")
    }
    jwt.verify(jwtToken, "secret123", (err: any, decodedToken: any) => {
      if (err) {
        return reject("my error : " + err) // never execute
      }
      resolve(decodedToken.userId)
    })
  })
}

export const graphqlHandler = async (req: Request, res: Response) => graphqlHTTP({
  schema: executableSchema,
  context: { currentUser: await decodeJwt(req.body.jwt) },
  // rootValue: root, // you could fix it using ES6 classes and put as new Query() here
  graphiql: true
})(req, res)