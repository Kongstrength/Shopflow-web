"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Boxes, PackageCheck, ShoppingBag, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useShop } from "./shop-provider";
import { ShopScreen } from "./screen-state";

function Metric({ label, value, note, icon: Icon, alert = false }: { label: string; value: string; note: string; icon: typeof Boxes; alert?: boolean }) {
  return <Card className={`rounded-lg shadow-none ${alert ? "border-red-300" : "border-slate-200"}`}><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className={`text-xs font-bold uppercase tracking-[.08em] ${alert ? "text-red-600" : "text-slate-500"}`}>{label}</p><strong className={`mt-3 block font-mono text-3xl tracking-tight ${alert ? "text-red-700" : "text-slate-950"}`}>{value}</strong></div><span className={`grid size-9 place-items-center rounded-md ${alert ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"}`}><Icon className="size-[18px]"/></span></div><p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">{note}</p></CardContent></Card>;
}

export function DashboardScreen() {
  const { products, context } = useShop();
  const lowStock = products.filter((product) => product.stock <= product.reorderLevel);
  const stockUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const stockValue = products.reduce((sum, product) => sum + Number(product.costPrice) * product.stock, 0);
  const healthy = products.filter((product) => product.stock > product.reorderLevel).length;

  return <ShopScreen><section>
    <header className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-orange-600">Live operations</p><h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">ภาพรวมการดำเนินงาน</h1><p className="mt-1 text-sm text-slate-500">{context?.store.name} • ข้อมูลสินค้าและสต็อกล่าสุดจากระบบ</p></div><Button variant="outline" className="h-9 rounded-md">ส่งออกรายงาน</Button></header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="รายการสินค้า" value={products.length.toLocaleString()} note="จำนวน SKU ที่ลงทะเบียน" icon={ShoppingBag}/><Metric label="พร้อมขาย" value={healthy.toLocaleString()} note="สต็อกสูงกว่าจุดสั่งซื้อ" icon={PackageCheck}/><Metric label="คงเหลือรวม" value={stockUnits.toLocaleString()} note="ชิ้นในทุกตำแหน่งจัดเก็บ" icon={Boxes}/><Metric label="สต็อกวิกฤต" value={lowStock.length.toLocaleString()} note="ต้องตรวจสอบและเติมสินค้า" icon={AlertTriangle} alert/></div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_.75fr]">
      <Card className="rounded-lg border-slate-200 shadow-none"><CardHeader className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4"><div><CardTitle className="text-base">ภาพรวมสินค้า</CardTitle><p className="mt-1 text-xs text-slate-500">สินค้าในระบบเรียงตามยอดคงเหลือ</p></div><Link href="/inventory" className="inline-flex items-center gap-1 text-xs font-bold text-orange-600">ดูคลังทั้งหมด <ArrowUpRight className="size-3.5"/></Link></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow className="bg-slate-50"><TableHead>สินค้า / SKU</TableHead><TableHead>หมวดหมู่</TableHead><TableHead className="text-right">ราคาขาย</TableHead><TableHead className="text-right">คงเหลือ</TableHead><TableHead>สถานะ</TableHead></TableRow></TableHeader><TableBody>{products.slice(0,6).map(product => <TableRow key={product.id}><TableCell><strong className="block text-sm">{product.name}</strong><span className="font-mono text-xs text-slate-400">{product.sku}</span></TableCell><TableCell className="text-sm text-slate-600">{product.category || "—"}</TableCell><TableCell className="text-right font-mono font-semibold">฿{Number(product.sellingPrice).toFixed(2)}</TableCell><TableCell className={`text-right font-mono font-semibold ${product.stock <= product.reorderLevel ? "text-red-600" : ""}`}>{product.stock}</TableCell><TableCell><Badge variant="outline" className={product.stock <= product.reorderLevel ? "border-orange-200 bg-orange-50 text-orange-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>{product.stock <= product.reorderLevel ? "ใกล้หมด" : "ปกติ"}</Badge></TableCell></TableRow>)}</TableBody></Table>{!products.length && <p className="py-16 text-center text-sm text-slate-400">ยังไม่มีสินค้า</p>}</CardContent></Card>
      <div className="space-y-4"><Card className="rounded-lg border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100 px-5 py-4"><CardTitle className="flex items-center gap-2 text-base"><WalletCards className="size-4 text-orange-500"/>มูลค่าสินค้าคงคลัง</CardTitle></CardHeader><CardContent className="p-5"><strong className="font-mono text-3xl">฿{stockValue.toLocaleString()}</strong><p className="mt-1 text-xs text-slate-500">คำนวณจากราคาทุนปัจจุบัน</p></CardContent></Card><Card className="rounded-lg border-red-200 shadow-none"><CardHeader className="border-b border-red-100 px-5 py-4"><CardTitle className="text-base text-red-700">เตือนสต็อกวิกฤต</CardTitle></CardHeader><CardContent className="space-y-4 p-5">{lowStock.slice(0,5).map(product => <div key={product.id}><div className="mb-2 flex items-center justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-sm">{product.name}</strong><span className="text-xs text-slate-500">จุดสั่งซื้อ {product.reorderLevel}</span></div><span className="font-mono text-sm font-bold text-red-600">{product.stock}</span></div><Progress value={product.reorderLevel ? Math.min(100, product.stock / product.reorderLevel * 100) : 100} className="h-1.5"/></div>)}{!lowStock.length && <p className="py-8 text-center text-sm text-slate-400">สต็อกอยู่ในระดับปกติ</p>}</CardContent></Card></div>
    </div>
  </section></ShopScreen>;
}
