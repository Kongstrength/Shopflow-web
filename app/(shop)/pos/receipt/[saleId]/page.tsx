import { ReceiptScreen } from "@/components/shopflow/receipt-screen";
export default async function ReceiptPage({ params }: { params: Promise<{ saleId: string }> }) { const { saleId } = await params; return <ReceiptScreen saleId={saleId}/>; }
