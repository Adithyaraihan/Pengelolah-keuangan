import * as yup from "yup";

export const insertTransactionSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError("amount must be a number")
    .positive("amount must be greater than 0")
    .required("amount is required"),

  description: yup.string().nullable(),

  transactionDate: yup
    .date()
    .typeError("invalid transactionDate")
    .required("transactionDate is required"),

  paymentMethod: yup
    .mixed()
    .oneOf(["CASH", "QRIS", "DEBIT"])

    .required("paymentMethod is required"),

  category: yup.string().trim().required("category is required"),
});

export const updateTransactionSchema = yup.object({
  amount: yup.number().positive().optional(),
  description: yup.string().nullable().optional(),
  transactionDate: yup.date().optional(),
  paymentMethod: yup
    .mixed()
    .oneOf(["CASH", "QRIS", "DEBIT"])
    .optional(),
  category: yup.string().optional(),
});