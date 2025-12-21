import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  getIncome,
  getExpense,
  createTransaction,
  getNetBalance,
  updateTransaction,
  deleteTransaction,
  readTransaction,
  getTransactionSummaryByMonth,
  getAllMonthTransactionByTransactionType,
} from "./transaction.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", readTransaction);
router.post("/", createTransaction);
router.get("/income", getIncome);
router.get("/outcome", getExpense);
router.get("/balance", getNetBalance);
router.get("/summary", getTransactionSummaryByMonth);
router.get("/chart", getAllMonthTransactionByTransactionType);

router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);
export default router;
