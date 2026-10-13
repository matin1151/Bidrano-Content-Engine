"use client";
import { useEffect, useState } from "react";
import { CONTENT_ITEMS } from "./mock-data";
import { orderData } from "./data";
export function useOrders() {
  const [orders, setOrders] = useState(CONTENT_ITEMS);
  useEffect(() => {
    const load = () => setOrders(orderData.list());
    load();
    window.addEventListener("storage", load);
    window.addEventListener("bidrano-data-change", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("bidrano-data-change", load);
    };
  }, []);
  return orders;
}
