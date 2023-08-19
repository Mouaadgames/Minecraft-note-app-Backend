import { Router } from "express";
import { loginHandler, signupHandler } from "../Controllers/authController"
const router = Router()

router.post("/login", loginHandler)

router.post("/signup", signupHandler)

export default router
