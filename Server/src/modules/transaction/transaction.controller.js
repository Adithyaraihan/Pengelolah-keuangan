import {
  insertTransactionSchema,
  updateTransactionSchema,
} from "./transaction.validation.js";
import {
  createTransaction as createTransactionService,
  deleteTransaction as deleteTransactionService,
  updateTransaction as updateTransactionService,
  readTransaction as readTransactionService,
  getTotalExpenseByYear,
  getTotalIncomeByYear,
  getTotalIncomeByMonth,
  getTotalExpenseByMonth,
  getTotalIncomeByDay,
  getTotalExpenseByDay,
  getNetBalanceByYear,
  getNetBalanceByMonth,
  getAllMonthTransactionByTransactionType as getAllMonthTransactionByTransactionTypeService,
  getAllYearTransactionByTransactionType,
} from "./transaction.service.js";

export const createTransaction = async (req, res) => {
  try {
    await insertTransactionSchema.validate(req.body, {
      abortEarly: false,
    });

    const {
      amount,
      description = null,
      transactionDate,
      paymentMethod,
      category,
    } = req.body;

    const userId = req.user.userId;

    const data = await createTransactionService(
      userId,
      amount,
      description,
      transactionDate,
      paymentMethod,
      category
    );

    return res.status(201).json({
      message: "successfully added data",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const readTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;

    const data = await readTransactionService(userId);

    return res.status(200).json({
      message: "successfully get data",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    await updateTransactionSchema.validate(req.body, {
      abortEarly: false,
    });

    const userId = req.user.userId;
    const id = Number(req.params.id);
    const { amount, description, transactionDate, paymentMethod, category } =
      req.body;

    const data = await updateTransactionService(
      userId,
      id,
      amount,
      description,
      transactionDate,
      paymentMethod,
      category
    );

    return res.status(200).json({
      message: "Transaction updated successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.userId;

    await deleteTransactionService(userId, id);

    return res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getIncome = async (req, res) => {
  try {
    const { date, year, month } = req.query;
    const userId = req.user.userId;
    let result;

    if (date) {
      result = await getTotalIncomeByDay(userId, date);
    } else if (year && month) {
      result = await getTotalIncomeByMonth(userId, year, month);
    } else if (year) {
      result = await getTotalIncomeByYear(userId, year);
    } else {
      return res.status(400).json({
        error: "Provide date OR year/month OR year",
      });
    }

    res.json({
      total_income: result._sum.amount ?? 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpense = async (req, res) => {
  try {
    const { date, year, month } = req.query;
    const userId = req.user.userId;
    let result;

    if (date) {
      result = await getTotalExpenseByDay(userId, date);
    } else if (year && month) {
      result = await getTotalExpenseByMonth(userId, year, month);
    } else if (year) {
      result = await getTotalExpenseByYear(userId, year);
    } else {
      return res.status(400).json({
        error: "Provide date OR year/month OR year",
      });
    }

    res.json({
      total_expense: result._sum.amount ?? 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionSummaryByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user.userId;

    if (!year || !month) {
      return res.status(400).json({
        error: "year and month are required",
      });
    }

    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);

    if (
      isNaN(parsedYear) ||
      isNaN(parsedMonth) ||
      parsedMonth < 1 ||
      parsedMonth > 12
    ) {
      return res.status(400).json({
        error: "Invalid year or month",
      });
    }

    const [income, expense] = await Promise.all([
      getTotalIncomeByMonth(userId, parsedYear, parsedMonth),
      getTotalExpenseByMonth(userId, parsedYear, parsedMonth),
    ]);

    const totalIncome = income?._sum?.amount ?? 0;
    const totalExpense = expense?._sum?.amount ?? 0;

    res.json({
      year: parsedYear,
      month: parsedMonth,
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getNetBalance = async (req, res) => {
  try {
    const { date, year, month } = req.query;
    const userId = req.user.userId;

    let result;

    // if (date) {
    //   ressult = await getNetBalanceByDay(date);
    // } ele

    if (year && month) {
      result = await getNetBalanceByMonth(userId, year, month);
    } else if (year) {
      result = await getNetBalanceByYear(userId, year);
    } else {
      return res.status(400).json({
        error: "Provide date OR year/month OR year",
      });
    }

    res.json({
      total_income: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllMonthTransactionByTransactionType = async (req, res) => {
  try {
    const { type, year, month } = req.query;
    const userId = req.user.userId;

    let result;
    if (year && month) {
      result = await getAllMonthTransactionByTransactionTypeService(
        userId,
        year,
        month,
        type
      );
    } else if (year) {
      result = await getAllYearTransactionByTransactionType(userId, year, type);
    } else {
      return res.status(400).json({
        error: "Provide date OR year/month OR year",
      });
    } 
    res.json({
      type: type,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
