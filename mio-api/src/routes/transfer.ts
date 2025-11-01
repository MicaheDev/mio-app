import { Router } from "express";
import { TransferController } from "../controllers/TransferController";
import multer from "multer"

const upload = multer({dest: "./tmp/my-uploads"})
const transferRoutes = Router();

transferRoutes.post(
  "/",
  upload.any(),
  TransferController.createTransfer
);

export default transferRoutes