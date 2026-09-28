"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiProduct, ShopContext } from "@/lib/shopflow-api";

export type Product = ApiProduct & { stock: number; emoji: string };

type ShopState = {
  products: Product[];
  context: ShopContext | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
};

const productIcons = ["🧺", "🧽", "✏️", "🥤", "📦", "🛍️"];
const ShopStateContext = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [context, setContext] = useState<ShopContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [rows, shopContext] = await Promise.all([
        api<ApiProduct[]>("/products"),
        api<ShopContext>("/context"),
      ]);
      setProducts(rows.map((product, index) => ({
        ...product,
        stock: product.stocks.reduce((sum, stock) => sum + stock.quantity, 0),
        emoji: productIcons[index % productIcons.length],
      })));
      setContext(shopContext);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "เชื่อมต่อ API ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);

  const value = useMemo(() => ({ products, context, loading, error, refresh }), [products, context, loading, error, refresh]);
  return <ShopStateContext.Provider value={value}>{children}</ShopStateContext.Provider>;
}

export function useShop() {
  const value = useContext(ShopStateContext);
  if (!value) throw new Error("useShop must be used inside ShopProvider");
  return value;
}
