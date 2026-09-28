"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Barcode, Loader2, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/shopflow-api";
import { Product, useShop } from "./shop-provider";
import { ShopScreen } from "./screen-state";

export function PosScreen() {
  const { products, context, refresh } = useShop();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [paying, setPaying] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const categories = useMemo(() => ["ทั้งหมด", ...Array.from(new Set(products.map((product) => product.category).filter(Boolean) as string[]))], [products]);
  const filtered = useMemo(() => products.filter((product) => `${product.name} ${product.sku} ${product.barcode ?? ""}`.toLowerCase().includes(query.toLowerCase()) && (category === "ทั้งหมด" || product.category === category)), [products, query, category]);
  const lines = Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([id, quantity]) => ({ product: products.find((item) => item.id === id)!, quantity })).filter((line) => line.product);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + Number(line.product.sellingPrice) * line.quantity, 0);
  const add = (product: Product) => {
    if ((cart[product.id] ?? 0) >= product.stock) return toast.error("สินค้าในสต็อกไม่เพียงพอ");
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
  };
  const change = (id: string, amount: number) => setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + amount) }));
  const pay = async () => {
    if (!context || !lines.length) return;
    setPaying(true);
    try {
      const sale = await api<{ receiptNo: string }>("/sales", { method: "POST", body: JSON.stringify({ storeId: context.store.id, warehouseId: context.warehouse.id, cashierId: context.user.id, items: lines.map(({ product, quantity }) => ({ productId: product.id, quantity })), discount: 0, paymentMethod: "CASH" }) });
      setCart({}); await refresh(); toast.success(`ชำระเงินสำเร็จ • ${sale.receiptNo}`);
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "ชำระเงินไม่สำเร็จ"); }
    finally { setPaying(false); }
  };
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.key === "F2") { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === "F9" && total > 0) { event.preventDefault(); void pay(); }
    };
    window.addEventListener("keydown", shortcut); return () => window.removeEventListener("keydown", shortcut);
  });

  return <ShopScreen><section className="-m-4 md:-m-6"><div className="grid min-h-[calc(100vh-4rem)] xl:grid-cols-[1fr_390px]">
    <div className="min-w-0 p-4 md:p-6"><header className="mb-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-orange-600">Point of sale</p><h1 className="mt-1 text-2xl font-bold tracking-tight">ขายหน้าร้าน</h1><p className="mt-1 text-sm text-slate-500">เลือกสินค้าเพื่อเพิ่มลงรายการ หรือสแกนบาร์โค้ด</p></header>
      <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><Input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อ, SKU หรือสแกนบาร์โค้ด..." className="h-11 rounded-md bg-white pl-9 pr-14"/><kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">F2</kbd></div><Button variant="outline" className="h-11 rounded-md bg-white"><Barcode/>สแกน</Button></div>
      <div className="my-4 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`h-8 shrink-0 rounded-md border px-3 text-xs font-bold ${category === item ? "border-orange-600 bg-orange-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-orange-300"}`}>{item}</button>)}</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">{filtered.map((product) => <button key={product.id} disabled={product.stock === 0} onClick={() => add(product)} className="group rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-orange-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"><div className="grid h-24 place-items-center rounded-md bg-slate-50 text-4xl">{product.emoji}</div><div className="mt-3 flex items-start justify-between gap-2"><div className="min-w-0"><strong className="block truncate text-sm">{product.name}</strong><span className="font-mono text-[11px] text-slate-400">{product.sku}</span></div><Plus className="size-4 shrink-0 text-orange-500 opacity-0 transition group-hover:opacity-100"/></div><div className="mt-2 flex items-end justify-between"><strong className="font-mono text-base text-orange-600">฿{Number(product.sellingPrice).toFixed(2)}</strong><span className={`font-mono text-[11px] ${product.stock <= product.reorderLevel ? "text-red-600" : "text-slate-500"}`}>คงเหลือ {product.stock}</span></div></button>)}{!filtered.length && <p className="col-span-full py-20 text-center text-sm text-slate-400">ไม่พบสินค้า</p>}</div>
    </div>
    <aside className="flex min-h-[620px] flex-col border-l border-slate-200 bg-white"><div className="flex h-16 items-center justify-between border-b border-slate-200 px-5"><div className="flex items-center gap-2"><ShoppingCart className="size-5 text-orange-500"/><h2 className="font-bold">รายการขาย</h2><Badge variant="secondary" className="font-mono">{itemCount}</Badge></div>{lines.length > 0 && <button onClick={() => setCart({})} className="text-xs font-bold text-red-600 hover:underline">ล้างรายการ</button>}</div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">{lines.map(({ product, quantity }) => <Card key={product.id} className="rounded-md border-slate-200 p-3 shadow-none"><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-md bg-slate-50 text-xl">{product.emoji}</span><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{product.name}</strong><span className="font-mono text-xs text-slate-400">฿{Number(product.sellingPrice).toFixed(2)} / ชิ้น</span></div><button onClick={() => setCart((current) => ({ ...current, [product.id]: 0 }))} className="self-start text-slate-400 hover:text-red-600" aria-label={`ลบ ${product.name}`}><Trash2 className="size-4"/></button></div><div className="mt-3 flex items-center justify-between"><div className="flex items-center overflow-hidden rounded-md border"><button onClick={() => change(product.id, -1)} className="grid size-8 place-items-center hover:bg-slate-50"><Minus className="size-3"/></button><span className="grid h-8 w-9 place-items-center border-x font-mono text-sm font-bold">{quantity}</span><button onClick={() => add(product)} className="grid size-8 place-items-center hover:bg-slate-50"><Plus className="size-3"/></button></div><strong className="font-mono">฿{(Number(product.sellingPrice) * quantity).toFixed(2)}</strong></div></Card>)}{!lines.length && <div className="grid h-full min-h-72 place-items-center text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-slate-400"><ShoppingCart className="size-6"/></span><p className="mt-4 text-sm font-bold">ยังไม่มีสินค้าในรายการ</p><p className="mt-1 text-xs text-slate-400">แตะสินค้าเพื่อเริ่มการขาย</p></div></div>}</div>
      <div className="border-t border-slate-200 bg-slate-50 p-5"><div className="space-y-2 text-sm"><div className="flex justify-between text-slate-500"><span>ยอดรวม ({itemCount} ชิ้น)</span><span className="font-mono">฿{total.toFixed(2)}</span></div><div className="flex justify-between border-t border-slate-200 pt-3"><strong>ยอดสุทธิ</strong><strong className="font-mono text-2xl text-orange-600">฿{total.toFixed(2)}</strong></div></div><Button disabled={!total || paying} onClick={() => void pay()} className="mt-4 h-12 w-full rounded-md bg-orange-600 text-base font-bold hover:bg-orange-700">{paying ? <><Loader2 className="animate-spin"/>กำลังบันทึก...</> : <>ชำระเงินสด <kbd className="ml-auto rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">F9</kbd></>}</Button></div>
    </aside>
  </div></section></ShopScreen>;
}
