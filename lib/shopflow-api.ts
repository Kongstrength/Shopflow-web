export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");
export const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? "63ccb076-8cd2-4ba5-a6e7-4b6cbbd4de7b";

export type ApiProduct = {
  id: string;
  companyId: string;
  sku: string;
  barcode: string | null;
  name: string;
  category: string | null;
  costPrice: string;
  sellingPrice: string;
  reorderLevel: number;
  imageUrl: string | null;
  isActive: boolean;
  stocks: { warehouseId: string; quantity: number }[];
};

export type ShopContext = {
  company: { id: string; name: string };
  store: { id: string; name: string; code: string };
  warehouse: { id: string; name: string };
  user: { id: string; firstName: string; lastName: string };
};

type ApiError = { message?: string | string[] };

export async function api<T>(path: string, init?: RequestInit, userId?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-company-id": COMPANY_ID,
      ...(userId ? { "x-user-id": userId } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new Error(message || `API error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

