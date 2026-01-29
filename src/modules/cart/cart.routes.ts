import { Router } from "express";
import { cartController } from "./cart.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../types";

const router = Router();

router.post("/items", auth(UserRole.CUSTOMER), cartController.addMedicineToCart);
router.get("/", auth(UserRole.CUSTOMER), cartController.getCart);
router.put("/items/:id", auth(UserRole.CUSTOMER), cartController.updateItem);
router.delete("/items/:id", auth(UserRole.CUSTOMER), cartController.removeItem);

export const cartRouter = router;