import { Router } from "express";
import { graphqlHandler } from "../Controllers/graphqlController";
import isAuthenticated from "../middleware/isAuthenticated";
const router = Router()

router.use("/graphql", isAuthenticated, graphqlHandler)

export default router