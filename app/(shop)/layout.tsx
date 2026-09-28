import { AppShell } from "@/components/shopflow/app-shell";
import { ShopProvider } from "@/components/shopflow/shop-provider";
export default function ShopLayout({ children }: { children: React.ReactNode }) { return <ShopProvider><AppShell>{children}</AppShell></ShopProvider>; }
