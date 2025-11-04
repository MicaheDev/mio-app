import { Router } from "express";
import { TransferController } from "../controllers/TransferController";
import { validate } from "../middlewares/validations";
import { DeclareTransferSchema } from "../model/Transfer";
import { authHandler } from "../middlewares/authHandler";
// import multer from "multer"

// const upload = multer({dest: "./tmp/my-uploads"})
const transferRoutes = Router();

transferRoutes.post(
  "/declare",
  authHandler,
  validate(DeclareTransferSchema),
  TransferController.declareTransfer
);

transferRoutes.post(
  "/cash-register",
  authHandler,
  TransferController.cashRegister
);

transferRoutes.patch(
  "/transfer/:transfer_id/verify",
  authHandler,
  TransferController.validateTransfer
);

export default transferRoutes;
