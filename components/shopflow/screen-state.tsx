"use client";

import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useShop } from "./shop-provider";

export function ShopScreen({ children }: { children: React.ReactNode }) {
  const { context, loading, error, refresh } = useShop();
  if (loading) return <div className="grid min-h-[70vh] place-items-center"><div className="text-center"><Loader2 className="mx-auto size-7 animate-spin text-orange-500"/><p className="mt-3 text-sm font-medium text-slate-500">กำลังโหลดข้อมูลร้าน...</p></div></div>;
  if (error || !context) return <div className="grid min-h-[70vh] place-items-center"><Card className="max-w-md rounded-lg border-slate-200 shadow-none"><CardContent className="p-8 text-center"><span className="mx-auto grid size-12 place-items-center rounded-lg bg-red-50 text-red-600"><WifiOff className="size-5"/></span><h1 className="mt-4 text-xl font-bold">เชื่อมต่อ ShopFlow API ไม่สำเร็จ</h1><p className="mt-2 text-sm leading-6 text-slate-500">{error}</p><Button onClick={() => void refresh()} className="mt-5 rounded-md bg-slate-950"><RefreshCw/>ลองอีกครั้ง</Button></CardContent></Card></div>;
  return children;
}
