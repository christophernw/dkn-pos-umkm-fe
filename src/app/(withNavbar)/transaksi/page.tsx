"use client";

import { DotIcon } from "@/public/icons/DotIcon";
import React, { useState, useEffect } from "react";
import { TransactionSummary } from "./module-elements/TransactionSummary";
import { PlusIcon } from "@/public/icons/PlusIcon";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/src/config";
import { notFound, useRouter } from "next/navigation";
import { NotesIcon } from "@/public/icons/notesIcon";

interface TransactionItem {
  id: string;
  transaction_type: "pemasukan" | "pengeluaran";
  category: string;
  total_amount: number;
  status: "Lunas" | "Belum Lunas";
  created_at: string;
}

interface PaginatedResponse {
  items: TransactionItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export default function TransactionMainPage() {
  notFound();










}
