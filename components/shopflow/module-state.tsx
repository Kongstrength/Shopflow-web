"use client";

import { Construction } from "lucide-react";

export function ModuleState({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="grid min-h-[calc(100vh-8rem)] place-items-center">
    <div className="max-w-md text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-lg border border-orange-200 bg-orange-50 text-orange-600"><Construction className="size-5" /></span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-orange-600">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  </section>;
}
