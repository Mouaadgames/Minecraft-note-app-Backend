import { Request, Response } from "express";
import { User } from "../Models/dbSchema/User";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const usernameRegex = /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
const jwtExpireTime = 30 * 24 * 60 * 60
const ourSecret = "secret123"
function createToken(userId: string): string {
  console.log(userId, " want a token")
  const theToken = jwt.sign({ userId }, ourSecret, { expiresIn: jwtExpireTime })
  return theToken
}

export async function loginHandler(req: Request, res: Response) {
  /*
   * 400 username not accepted
   * 404 username dose not exist
   * 406 pwd or username is wrong
   * 200 your in
   */
  const { username, password } = req.body
  //check if the username & password is in the correct shape
  if (!usernameRegex.test(username))
    return res.sendStatus(400)

  //check the db and return if the user even exist
  const currentUser = await User.findOne({ username })
  if (!currentUser?.password) return res.sendStatus(404)

  //compare the pass 
  const haveAccess = await bcrypt.compare(password, currentUser.password)
  if (!haveAccess) return res.sendStatus(406)

  //create the JWT that contain the user id
  const token = createToken(currentUser._id.toString())
  res.cookie("jwt", token, { httpOnly: true, maxAge: jwtExpireTime * 1000 })

  //return JWT via cookies to the user
  res.status(200).send({ jwt: token }) // just for cors now
}

export async function signupHandler(req: Request, res: Response) {
 /**
  * 400 username or password dose not meet up the rules
  * 409 username already exist
  * 201 your in
  */

  let { username, password } = req.body

  //check if the username & password is in the correct shape
  if (!(usernameRegex.test(username) && passwordRegex.test(password)))
    return res.sendStatus(400)

  //check if we have a conflict  
  if (await User.exists({ username })) return res.sendStatus(409)

  //hash the pass
  const salt = await bcrypt.genSalt()
  password = await bcrypt.hash(password, salt)

  //store in the db
  const newUser = await User.create({ username, password })

  //create the JWT that contain the user id
  res.cookie("jwt", createToken(newUser._id.toString()), { httpOnly: true, maxAge: jwtExpireTime * 1000 })

  //return JWT to the user
  res.status(201).send({ jwt: "hello world first time" })
}

