import mongoose, { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  currency: { type: String, default: "TRY" },
}, { timestamps: true });

const Transaction = models.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
