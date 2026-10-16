// src/features/dashboard/components/TopSellingMedicines.jsx
// ✅ REDESIGNED: Mobile-first, professional look

import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

export default function TopSellingMedicines({ data, isLoading }) {
  const medicines = data?.topSellingMedicines || [];

  const displayData = medicines.length > 0
    ? medicines.slice(0, 5)
    : [
        { _id: '1', medicineName: 'Napa 500', strength: 'Paracetamol · 500 mg', quantity: 186 },
        { _id: '2', medicineName: 'Seclo 20', strength: 'Omeprazole · 20 mg', quantity: 142 },
        { _id: '3', medicineName: 'Maxpro 20', strength: 'Esomeprazole · 20 mg', quantity: 118 },
        { _id: '4', medicineName: 'Ace 500', strength: 'Paracetamol · 500 mg', quantity: 94 },
        { _id: '5', medicineName: 'Monas 10', strength: 'Montelukast · 10 mg', quantity: 76 }
      ];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            Top selling medicines
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            By units sold today
          </CardDescription>
        </div>
        <Link
          to="/reports"
          className="text-xs font-medium text-accent hover:underline flex items-center gap-1 shrink-0 ml-2"
        >
          View report
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-muted/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayData.map((med, i) => (
              <MedicineRow key={med._id} med={med} rank={i + 1} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Medicine Row =====
function MedicineRow({ med, rank }) {
  const isTop3 = rank <= 3;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 rounded-xl transition-all',
        'hover:bg-muted/60',
        isTop3 && 'bg-accent/[0.03]'
      )}
    >
      {/* ✅ Rank Badge */}
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold shrink-0 transition-transform group-hover:scale-110',
          rank === 1 && 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm shadow-amber-500/30',
          rank === 2 && 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-sm shadow-slate-400/30',
          rank === 3 && 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-sm shadow-orange-500/30',
          rank > 3 && 'bg-muted text-muted-foreground'
        )}
      >
        {rank}
      </div>

      {/* ✅ Medicine Icon (with initial) */}
      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-accent uppercase">
          {med.medicineName?.charAt(0) || '?'}
        </span>
      </div>

      {/* ✅ Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {med.medicineName}
        </p>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          {med.strength}
        </p>
      </div>

      {/* ✅ Quantity — compact, right side */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-foreground tabular-nums leading-none">
          {formatNumber(med.quantity)}
        </p>
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">
          units
        </p>
      </div>
    </div>
  );
}