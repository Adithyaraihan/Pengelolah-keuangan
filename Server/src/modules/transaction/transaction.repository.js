import e from "cors";
import prisma from "../../database/prisma.js";

export const findCategoryIdByName = async (category) => {
  const result = await prisma.category.findFirst({
    where: { name: category },
    select: { id: true },
  });

  return result?.id ?? null;
};

export const findTransactionById = async (userId, id) => {
  return prisma.transaction.findUnique({
    where: { userId, id },
  });
};

export const readTransaction = async (userId) => {
  return await prisma.transaction.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      amount: true,
      paymentMethod: true,
      transactionDate: true,
      category: {
        select: {
          name: true,
          type: { select: { name: true } },
        },
      },
    },
  });
};

export const createTransaction = async (
  userId,
  amount,
  description = null,
  transactionDate,
  paymentMethod,
  categoryId
) => {
  return await prisma.transaction.create({
    data: {
      userId,
      amount,
      description,
      transactionDate,
      paymentMethod,
      categoryId,
    },
  });
};

export const updateTransactionById = async (
  id,
  amount,
  description,
  transactionDate,
  paymentMethod,
  categoryId
) => {
  return prisma.transaction.update({
    where: { id },
    data: {
      amount,
      description,
      transactionDate,
      paymentMethod,
      categoryId,
    },
  });
};

export const deleteTransactionById = async (id) => {
  return prisma.transaction.delete({
    where: { id },
  });
};

export const getTotalAmountByYearAndType = async (
  userId,
  year,
  typeTransaction
) => {
  const startDate = new Date(year - 1, 12, 1); //2024-12-31T17:00:00.000Z  misal year=25
  const endDate = new Date(year, 12, 1); //2025-12-31T17:00:00.000Z   jadi dah betul setahun

  return prisma.transaction.aggregate({
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
      category: {
        type: {
          name: typeTransaction,
        },
      },
    },
    _sum: {
      amount: true,
    },
  });
};

export const getTotalAmountByMonthAndType = async (
  userId,
  year,
  month,
  typeTransaction
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return prisma.transaction.aggregate({
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
      category: {
        type: {
          name: typeTransaction,
        },
      },
    },

    _sum: {
      amount: true,
    },
  });
};

export const getTotalAmountByDayAndType = async (
  userId,
  date,
  typeTransaction
) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  return prisma.transaction.aggregate({
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
      category: {
        type: {
          name: typeTransaction,
        },
      },
    },
    _sum: {
      amount: true,
    },
  });
};

export const getAllPengeluaranGroupedpermonth = async (
  userId,
  year,
  month,
  typeTransaction
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const result = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
      category: {
        type: {
          name: typeTransaction,
        },
      },
    },
    _sum: {
      amount: true,
    },
  });

  const categories = await prisma.category.findMany({
    where: {
      id: { in: result.map((r) => r.categoryId) },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return result.map((r) => ({
    category: categories.find((c) => c.id === r.categoryId).name,
    totalAmount: r._sum.amount,
  }));
};

export const getAllPengeluaranGroupedperyear = async (
  userId,
  year,
  typeTransaction
) => {
  const startDate = new Date(year - 1, 12, 1); //2024-12-31T17:00:00.000Z  misal year=25
  const endDate = new Date(year, 12, 1); //2025-12-31T17:00:00.000Z   jadi dah betul setahun

  const result = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
      category: {
        type: {
          name: typeTransaction,
        },
      },
    },
    _sum: {
      amount: true,
    },
  });

  const categories = await prisma.category.findMany({
    where: {
      id: { in: result.map((r) => r.categoryId) },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return result.map((r) => ({
    category: categories.find((c) => c.id === r.categoryId).name,
    totalAmount: r._sum.amount,
  }));
};

const data = await getAllPengeluaranGroupedperyear(1, 2025, "Pengeluaran");
console.log(data);
