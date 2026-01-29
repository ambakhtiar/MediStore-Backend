import { Router } from "express";
import auth from "../../middleware/auth";
import { profileController } from "./profile.controller";

const router = Router();

router.get("/me", auth(), profileController.getProfile);
router.put("/me", auth(), profileController.updateProfile);
router.patch("/me/password", auth(), profileController.changePassword);

export const profileRouter = router;