"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2, Plus, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiProduct } from "@/lib/shopflow-api";
import { Product, useShop } from "./shop-provider";
import { ShopScreen } from "./screen-state";

function Field({ id, label, type = "text", defaultValue, required = true }: { id: string; label: string; type?: string; defaultValue?: string; required?: boolean }) {
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} name={id} type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} defaultValue={defaultValue} required={required} className="mt-2 rounded-md" /></div>;
}

function ProductDialog({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  const { context, refresh } = useShop(); const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!context) return; const data = new FormData(event.currentTarget); setSaving(true);
    try {
      const product = await api<ApiProduct>("/products", { method: "POST", body: JSON.stringify({ sku: data.get("sku"), barcode: data.get("barcode") || undefined, name: data.get("name"), category: data.get("category"), costPrice: Number(data.get("costPrice")), sellingPrice: Number(data.get("sellingPrice")), reorderLevel: Number(data.get("reorderLevel")) }) });
      const initialStock = Number(data.get("initialStock"));
      if (initialStock > 0) await api("/inventory/adjustments", { method: "POST", body: JSON.stringify({ warehouseId: context.warehouse.id, productId: product.id, quantity: initialStock, note: "ยอดตั้งต้นจากหน้าสินค้า" }) }, context.user.id);
      await refresh(); setOpen(false); toast.success("เพิ่มสินค้าเรียบร้อย");
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "เพิ่มสินค้าไม่สำเร็จ"); } finally { setSaving(false); }
  };
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="rounded-lg"><form onSubmit={submit}><DialogHeader><DialogTitle>เพิ่มสินค้าใหม่</DialogTitle><DialogDescription>บันทึกสินค้าและยอดตั้งต้นลงคลังหลัก</DialogDescription></DialogHeader><div className="my-5 grid gap-4 sm:grid-cols-2"><Field id="sku" label="SKU"/><Field id="barcode" label="บาร์โค้ด" required={false}/><div className="sm:col-span-2"><Field id="name" label="ชื่อสินค้า"/></div><div className="sm:col-span-2"><Field id="category" label="หมวดหมู่" required={false}/></div><Field id="costPrice" label="ราคาทุน" type="number"/><Field id="sellingPrice" label="ราคาขาย" type="number" defaultValue="20"/><Field id="reorderLevel" label="จุดสั่งซื้อ" type="number" defaultValue="20"/><Field id="initialStock" label="สต็อกตั้งต้น" type="number" defaultValue="0"/></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button><Button disabled={saving} className="rounded-md bg-orange-600 hover:bg-orange-700">{saving && <Loader2 className="animate-spin"/>}บันทึกสินค้า</Button></DialogFooter></form></DialogContent></Dialog>;
}

function AdjustmentDialog({ product, setProduct }: { product: Product | null; setProduct: (value: Product | null) => void }) {
  const { context, refresh } = useShop(); const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!context || !product) return; const data = new FormData(event.currentTarget); setSaving(true);
    try { await api("/inventory/adjustments", { method: "POST", body: JSON.stringify({ warehouseId: context.warehouse.id, productId: product.id, quantity: Number(data.get("quantity")), note: data.get("note") }) }, context.user.id); await refresh(); setProduct(null); toast.success("ปรับสต็อกเรียบร้อย"); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "ปรับสต็อกไม่สำเร็จ"); } finally { setSaving(false); }
  };
  return <Dialog open={!!product} onOpenChange={(open) => !open && setProduct(null)}><DialogContent className="rounded-lg"><form onSubmit={submit}><DialogHeader><DialogTitle>ปรับยอดสต็อก</DialogTitle><DialogDescription>{product?.name} • คงเหลือ {product?.stock} ชิ้น ใช้ค่าบวกเพื่อเพิ่มและค่าลบเพื่อลด</DialogDescription></DialogHeader><div className="my-5 space-y-4"><div><Label htmlFor="quantity">จำนวนที่ปรับ</Label><Input id="quantity" name="quantity" type="number" required placeholder="เช่น 12 หรือ -3" className="mt-2 rounded-md"/></div><div><Label htmlFor="note">หมายเหตุ</Label><Input id="note" name="note" required placeholder="เหตุผลในการปรับสต็อก" className="mt-2 rounded-md"/></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setProduct(null)}>ยกเลิก</Button><Button disabled={saving} className="rounded-md bg-slate-950">{saving && <Loader2 className="animate-spin"/>}ยืนยันการปรับ</Button></DialogFooter></form></DialogContent></Dialog>;
}

export function CatalogScreen({ inventory = false }: { inventory?: boolean }) {
  const { products, context } = useShop(); const [query, setQuery] = useState(""); const [addOpen, setAddOpen] = useState(false); const [selected, setSelected] = useState<Product | null>(null);
  const filtered = useMemo(() => products.filter((product) => `${product.name} ${product.sku} ${product.barcode ?? ""} ${product.category ?? ""}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const lowStock = products.filter((product) => product.stock <= product.reorderLevel).length;
  return <ShopScreen><section><header className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-orange-600">{inventory ? "Inventory control" : "Product master"}</p><h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{inventory ? "สต็อกและคลังสินค้า" : "ข้อมูลสินค้า"}</h1><p className="mt-1 text-sm text-slate-500">{inventory ? `${context?.warehouse.name} • ตรวจสอบและปรับยอดคงเหลือ` : "จัดการ SKU ราคา และจุดสั่งซื้อ"}</p></div>{!inventory && <Button onClick={() => setAddOpen(true)} className="h-9 rounded-md bg-orange-600 hover:bg-orange-700"><Plus/>เพิ่มสินค้าใหม่</Button>}</header>
    <div className="mb-4 grid gap-3 sm:grid-cols-3"><Card className="rounded-lg border-slate-200 shadow-none"><CardContent className="p-4"><p className="text-xs font-bold uppercase text-slate-500">สินค้าทั้งหมด</p><strong className="mt-2 block font-mono text-2xl">{products.length}</strong></CardContent></Card><Card className="rounded-lg border-emerald-200 shadow-none"><CardContent className="p-4"><p className="text-xs font-bold uppercase text-emerald-700">พร้อมขาย</p><strong className="mt-2 block font-mono text-2xl text-emerald-700">{products.length - lowStock}</strong></CardContent></Card><Card className="rounded-lg border-orange-200 shadow-none"><CardContent className="p-4"><p className="text-xs font-bold uppercase text-orange-700">ใกล้หมด</p><strong className="mt-2 block font-mono text-2xl text-orange-700">{lowStock}</strong></CardContent></Card></div>
    <Card className="rounded-lg border-slate-200 shadow-none"><div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3"><div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อสินค้า, SKU หรือบาร์โค้ด..." className="h-9 rounded-md pl-9"/></div><Button variant="outline" className="h-9 rounded-md"><SlidersHorizontal/>ตัวกรอง</Button></div><CardContent className="p-0"><Table><TableHeader><TableRow className="bg-slate-100"><TableHead>สินค้า / SKU</TableHead><TableHead>หมวดหมู่</TableHead><TableHead className="text-right">ราคาทุน</TableHead><TableHead className="text-right">ราคาขาย</TableHead><TableHead className="text-right">คงเหลือ</TableHead><TableHead>สถานะ</TableHead>{inventory && <TableHead className="text-right">จัดการ</TableHead>}</TableRow></TableHeader><TableBody>{filtered.map(product => <TableRow key={product.id} className="hover:bg-orange-50/60"><TableCell><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-md border bg-slate-50 text-xl">{product.emoji}</span><div><strong className="block text-sm">{product.name}</strong><span className="font-mono text-xs text-slate-400">{product.sku}{product.barcode ? ` • ${product.barcode}` : ""}</span></div></div></TableCell><TableCell className="text-sm text-slate-600">{product.category || "—"}</TableCell><TableCell className="text-right font-mono">฿{Number(product.costPrice).toFixed(2)}</TableCell><TableCell className="text-right font-mono font-bold">฿{Number(product.sellingPrice).toFixed(2)}</TableCell><TableCell className={`text-right font-mono font-bold ${product.stock <= product.reorderLevel ? "text-orange-700" : ""}`}>{product.stock}</TableCell><TableCell><Badge variant="outline" className={product.stock <= product.reorderLevel ? "border-orange-200 bg-orange-50 text-orange-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>{product.stock <= product.reorderLevel ? "ใกล้หมด" : "ปกติ"}</Badge></TableCell>{inventory && <TableCell className="text-right"><Button onClick={() => setSelected(product)} size="sm" variant="outline" className="h-8 rounded-md">ปรับยอด</Button></TableCell>}</TableRow>)}</TableBody></Table>{!filtered.length && <p className="py-16 text-center text-sm text-slate-400">ไม่พบสินค้า</p>}</CardContent></Card>
    <ProductDialog open={addOpen} setOpen={setAddOpen}/><AdjustmentDialog product={selected} setProduct={setSelected}/>
  </section></ShopScreen>;
}
