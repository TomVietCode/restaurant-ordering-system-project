import { signOut } from '@/auth';
import Link from 'next/link';
import { ChefHat, Receipt, ArrowRight } from 'lucide-react';

export default function SelectRolePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl text-center">
        {/* Title */}
        <h2 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl uppercase">
          Chọn phân hệ làm việc:
        </h2>

        {/* 2 Card Boxes */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card Bếp */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-2xl bg-primary/10 p-4 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <ChefHat className="size-10" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-800 uppercase">Bếp</h3>
            </div>
            <Link
              href="/kitchen"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-dark active:scale-95"
            >
              <span>Vào phân hệ Bếp</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Card Thu ngân */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-2xl bg-emerald-100 p-4 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white">
                <Receipt className="size-10" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-slate-800 uppercase">Thu ngân</h3>
            </div>
            <Link
              href="/cashier"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 font-semibold text-white transition-all duration-200 hover:bg-emerald-800 active:scale-95"
            >
              <span>Vào phân hệ Thu ngân</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
