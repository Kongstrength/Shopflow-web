"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, Boxes, CircleDollarSign, LayoutDashboard, Menu, Package, Search, Settings, ShoppingCart, Store, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { useShop } from "./shop-provider";

const navigation = [
  { href: "/dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/pos", label: "ขายหน้าร้าน", icon: ShoppingCart },
  { href: "/products", label: "สินค้า", icon: Package },
  { href: "/inventory", label: "สต็อกสินค้า", icon: Boxes },
  { href: "/purchases", label: "จัดซื้อ", icon: Store },
  { href: "/sales", label: "รายการขาย", icon: CircleDollarSign },
  { href: "/customers", label: "ลูกค้า", icon: Users },
  { href: "/reports", label: "รายงาน", icon: BarChart3 },
];

function Brand() {
  return <Link href="/dashboard" className="flex items-center gap-3" aria-label="ShopFlow Dashboard">
    <span className="grid size-11 place-items-center rounded-md bg-orange-500 font-mono text-sm font-extrabold text-white">20</span>
    <span><strong className="block text-lg font-bold tracking-tight text-white">ShopFlow</strong><small className="block text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Retail ERP</small></span>
  </Link>;
}

function Navigation({ close }: { close?: () => void }) {
  const pathname = usePathname();
  const { products } = useShop();
  const lowStock = products.filter((product) => product.stock <= product.reorderLevel).length;
  return <nav className="mt-5 space-y-1" aria-label="เมนูหลัก">
    {navigation.map(({ href, label, icon: Icon }) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} onClick={close} className={`group flex h-10 items-center gap-3 rounded-md border-l-2 px-3 text-sm font-semibold transition ${active ? "border-orange-500 bg-slate-800 text-white" : "border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-white"}`}>
        <Icon className={`size-[18px] ${active ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300"}`} />
        <span>{label}</span>
        {href === "/inventory" && lowStock > 0 ? <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 font-mono text-[10px] text-white">{lowStock}</span> : null}
      </Link>;
    })}
  </nav>;
}

function StoreCard() {
  const { context } = useShop();
  return <div className="rounded-md border border-slate-700 bg-slate-800/80 p-3">
    <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-orange-500/15 font-mono text-xs font-bold text-orange-400">S1</span><div className="min-w-0"><strong className="block truncate text-xs text-white">{context?.company.name ?? "ShopFlow"}</strong><span className="block truncate text-[11px] text-slate-400">{context ? `${context.store.name} • เปิดอยู่` : "กำลังเชื่อมต่อ..."}</span></div></div>
  </div>;
}

function SidebarContent({ close }: { close?: () => void }) {
  return <div className="flex h-full flex-col bg-slate-950 p-4 text-white">
    <Brand />
    <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-600">เมนูหลัก</p>
    <Navigation close={close} />
    <div className="mt-auto space-y-4 border-t border-slate-800 pt-4"><Link href="/settings" onClick={close} className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"><Settings className="size-[18px]" />ตั้งค่า</Link><StoreCard /></div>
  </div>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { context, products } = useShop();
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const lowStock = products.filter((product) => product.stock <= product.reorderLevel).length;

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block"><SidebarContent /></aside>
    <div className="lg:pl-60">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild><button className="grid size-10 place-items-center rounded-md border border-slate-200 lg:hidden" aria-label="เปิดเมนู"><Menu className="size-5" /></button></SheetTrigger>
          <SheetContent side="left" className="w-60 border-0 p-0"><SheetTitle className="sr-only">เมนู ShopFlow</SheetTitle><SidebarContent close={() => setMobileOpen(false)} /></SheetContent>
        </Sheet>
        <div className="relative w-full max-w-md"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><Input ref={searchRef} placeholder="ค้นหาสินค้า ใบเสร็จ หรือเมนู..." className="h-9 rounded-md border-slate-300 bg-slate-50 pl-9 pr-16 text-sm focus-visible:border-orange-500 focus-visible:ring-orange-500/15"/><kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500">Ctrl+K</kbd></div>
        <div className="ml-auto hidden items-center gap-2 xl:flex"><span className="inline-flex h-8 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800"><i className="size-2 rounded-full bg-emerald-500"/>เปิดกะ 08:30 น.</span><span className="inline-flex h-8 items-center rounded-md bg-slate-100 px-3 text-xs font-semibold text-slate-700">ลิ้นชักเงินสด: พร้อม</span></div>
        <button onClick={() => toast.info(lowStock ? `สินค้าใกล้หมด ${lowStock} รายการ` : "สต็อกอยู่ในระดับปกติ")} className="relative grid size-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-white" aria-label="การแจ้งเตือน"><Bell className="size-4"/>{lowStock > 0 && <i className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white"/>}</button>
        <div className="hidden items-center gap-2 sm:flex"><span className="grid size-9 place-items-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">{context?.user.firstName.slice(0,1) ?? "—"}</span><div className="min-w-24"><strong className="block text-xs">{context ? `${context.user.firstName} ${context.user.lastName}` : "กำลังโหลด"}</strong><span className="block text-[11px] text-slate-500">ผู้จัดการร้าน</span></div></div>
      </header>
      <main className="mx-auto max-w-[1600px] p-4 md:p-6">{children}</main>
    </div>
    <Toaster position="bottom-right" richColors />
  </div>;
}
