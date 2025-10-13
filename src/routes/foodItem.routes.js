import { Router } from "express";
import { createFoodItem,deletedFoodItem,getAllFoodItems, getSingleFoodItem,updateFoodItem } from "../controllers/foodItem.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/create-foodItem").post( 
    upload.single("image")
    , createFoodItem
)

router.route("/get-all-foodItems").get(getAllFoodItems);
router.route("/get/:foodName").get(getSingleFoodItem);
router.route("/delete/:id").delete(deletedFoodItem);

router.route("/update/:id").patch(
     upload.single("image"), updateFoodItem);



export default router