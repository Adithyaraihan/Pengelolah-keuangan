import {
  createTransaction as createTransactionRepository,
  readTransaction as readTransactionRepository,
  findCategoryIdByName,
  getTotalAmountByDayAndType,
  getTotalAmountByMonthAndType,
  getTotalAmountByYearAndType,
  findTransactionById,
  updateTransactionById,
  deleteTransactionById,
  getAllPengeluaranGroupedpermonth,
  getAllPengeluaranGroupedperyear,
} from "./transaction.repository.js";

export const readTransaction = async (userId) => {
  const data = await readTransactionRepository(userId);

  return data.map((t) => ({
    id: t.id,
    jenis: t.category.type.name,
    amount: Number(t.amount),
    paymentMethod: t.paymentMethod,
    category: t.category.name,
    transactionDate: t.transactionDate,
  }));
};

export const createTransaction = async (
  userId,
  amount,
  description = null,
  transactionDate,
  paymentMethod,
  category
) => {
  const categoryId = await findCategoryIdByName(category);

  if (!categoryId) {
    throw new Error("Category not found");
  }

  return await createTransactionRepository(
    userId,
    amount,
    description,
    transactionDate,
    paymentMethod,
    categoryId
  );
};

export const updateTransaction = async (
  userId,
  id,
  amount,
  description,
  transactionDate,
  paymentMethod,
  category
) => {
  const existing = await findTransactionById(userId, id);
  if (!existing) throw new Error("Transaction not found");

  console.log(existing);

  const categoryId = await findCategoryIdByName(category);
  if (!categoryId) throw new Error("Category not found");

  return await updateTransactionById(
    id,
    amount,
    description,
    transactionDate,
    paymentMethod,
    categoryId
  );
};

export const deleteTransaction = async (userId, id) => {
  const existing = await findTransactionById(userId, id);

  if (!existing) {
    throw new Error("Transaction not found");
  }

  return deleteTransactionById(id);
};

export const getTotalIncomeByYear = async (userId, year) => {
  return await getTotalAmountByYearAndType(userId, year, "Pemasukan");
};

export const getTotalExpenseByYear = async (userId, year) => {
  return await getTotalAmountByYearAndType(userId, year, "Pengeluaran");
};

export const getTotalIncomeByMonth = async (userId, year, month) => {
  return await getTotalAmountByMonthAndType(userId, year, month, "Pemasukan");
};

export const getTotalExpenseByMonth = async (userId, year, month) => {
  return await getTotalAmountByMonthAndType(userId, year, month, "Pengeluaran");
};

export const getTotalIncomeByDay = async (userId, date) => {
  return await getTotalAmountByDayAndType(userId, date, "Pemasukan");
};

export const getTotalExpenseByDay = async (userId, date) => {
  return await getTotalAmountByDayAndType(userId, date, "Pengeluaran");
};

export const getNetBalanceByYear = async (userId, year) => {
  const incomeByYear = await getTotalAmountByYearAndType(
    userId,
    year,
    "Pemasukan"
  );
  const ekspenseByYear = await getTotalAmountByYearAndType(
    userId,
    year,
    "Pengeluaran"
  );

  const totalMoneyByYear =
    incomeByYear._sum.amount - ekspenseByYear._sum.amount;

  return totalMoneyByYear;
};

export const getNetBalanceByMonth = async (userId, year, month) => {
  const incomeByMonth = await getTotalAmountByMonthAndType(
    userId,
    year,
    month,
    "Pemasukan"
  );
  const ekspenseByMonth = await getTotalAmountByMonthAndType(
    userId,
    year,
    month,
    "Pengeluaran"
  );

  const totalMoneyByMonth =
    incomeByMonth._sum.amount - ekspenseByMonth._sum.amount;

  return totalMoneyByMonth;
};

export const getAllMonthTransactionByTransactionType = async (
  userId,
  year,
  month,
  typeTransaction
) => {
  return await getAllPengeluaranGroupedpermonth(
    userId,
    year,
    month,
    typeTransaction
  );
};

export const getAllYearTransactionByTransactionType = async (
  userId,
  year,
  typeTransaction
) => {
  return await getAllPengeluaranGroupedperyear(userId, year, typeTransaction);
};
