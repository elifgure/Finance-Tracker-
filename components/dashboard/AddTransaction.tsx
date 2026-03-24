"use client";

import { useState } from "react";

export default function AddTransaction(){
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");

    return(
      <div className="flex gap-2 mb-6">
      <input
        className="border p-2"
        placeholder="Amount"
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        className="border p-2"
        placeholder="Category"
        onChange={(e) => setCategory(e.target.value)}
      />
      <button className="bg-black text-white px-4">
        Add
      </button>
    </div>
  );
}