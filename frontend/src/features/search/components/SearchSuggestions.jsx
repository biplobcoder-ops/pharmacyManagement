// src/features/search/components/SearchSuggestions.jsx
// Live search suggestions dropdown

import { useNavigate } from 'react-router-dom';
import {
  Loader2, Package, Users, Receipt, ShoppingBag, Truck, Search, ArrowRight
} from 'lucide-react';
import { cn, formatCurrency, getInitials } from '@/lib/utils';
import { useGlobalSearchQuery } from '../searchApi';

export default function SearchSuggestions({ query, onClose }) {
  const navigate = useNavigate();

  // ✅ Skip if query empty
  const { data: res, isLoading, isFetching } = useGlobalSearchQuery(
    { q: query, limit: 3 },
    { skip: !query || query.trim().length < 2 }
  );

  const results = res?.data;

  // ✅ Handle empty
  if (!query || query.trim().length < 2) {
    return (
      <div className="p-6 text-center">
        <Search className="h-6 w-6 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-xs text-muted-foreground">
          Type at least 2 characters to search
        </p>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground">Searching...</p>
      </div>
    );
  }

  if (!results || results.totalCount === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          No results for "{query}"
        </p>
      </div>
    );
  }

  const handleNavigate = (path) => {
    navigate(path);
    onClose?.();
  };

  const handleViewAll = () => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose?.();
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
      {/* Medicines */}
      {results.medicines?.length > 0 && (
        <Section title="Medicines" icon={Package} color="text-emerald-500">
          {results.medicines.map((med) => (
            <SuggestionRow
              key={med._id}
              onClick={() => handleNavigate(`/medicines?search=${encodeURIComponent(med.name)}`)}
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Package className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {med.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {med.strength} • Stock: {med.totalStock || 0}
                </p>
              </div>
            </SuggestionRow>
          ))}
        </Section>
      )}

      {/* Customers */}
      {results.customers?.length > 0 && (
        <Section title="Customers" icon={Users} color="text-blue-500">
          {results.customers.map((c) => (
            <SuggestionRow
              key={c._id}
              onClick={() => handleNavigate(`/customers?search=${encodeURIComponent(c.name)}`)}
            >
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-blue-500">
                  {getInitials(c.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {c.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {c.phone || 'No phone'}
                </p>
              </div>
            </SuggestionRow>
          ))}
        </Section>
      )}

      {/* Suppliers */}
      {results.suppliers?.length > 0 && (
        <Section title="Suppliers" icon={Truck} color="text-orange-500">
          {results.suppliers.map((s) => (
            <SuggestionRow
              key={s._id}
              onClick={() => handleNavigate(`/suppliers?search=${encodeURIComponent(s.name)}`)}
            >
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <Truck className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {s.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {s.company || s.phone || '—'}
                </p>
              </div>
            </SuggestionRow>
          ))}
        </Section>
      )}

      {/* Sales */}
      {results.sales?.length > 0 && (
        <Section title="Sales Invoices" icon={Receipt} color="text-accent">
          {results.sales.map((s) => (
            <SuggestionRow
              key={s._id}
              onClick={() => handleNavigate(`/sales?search=${encodeURIComponent(s.invoiceNumber)}`)}
            >
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Receipt className="h-3.5 w-3.5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {s.invoiceNumber}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {s.customerName} • {formatCurrency(s.total)}
                </p>
              </div>
            </SuggestionRow>
          ))}
        </Section>
      )}

      {/* Purchases */}
      {results.purchases?.length > 0 && (
        <Section title="Purchase Invoices" icon={ShoppingBag} color="text-purple-500">
          {results.purchases.map((p) => (
            <SuggestionRow
              key={p._id}
              onClick={() => handleNavigate(`/purchases?search=${encodeURIComponent(p.invoiceNumber)}`)}
            >
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {p.invoiceNumber}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {p.supplier?.name || '—'} • {formatCurrency(p.total)}
                </p>
              </div>
            </SuggestionRow>
          ))}
        </Section>
      )}

      {/* View All */}
      <button
        type="button"
        onClick={handleViewAll}
        className="w-full flex items-center justify-center gap-1.5 p-3 text-xs font-medium text-accent hover:bg-muted/40 transition-colors border-t border-border"
      >
        View all results for "{query}"
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

// ===== Helpers =====
function Section({ title, icon: Icon, color, children }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20">
        <Icon className={cn('h-3 w-3', color)} />
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SuggestionRow({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/40 transition-colors text-left"
    >
      {children}
    </button>
  );
}