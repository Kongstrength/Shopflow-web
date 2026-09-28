import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"ShopFlow — Retail ERP", description:"ระบบ POS และบริหารร้านค้าปลีกครบวงจร", icons:{ icon:"/favicon.svg", shortcut:"/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children:React.ReactNode }>) { return <html lang="th"><body className="antialiased">{children}</body></html>; }
