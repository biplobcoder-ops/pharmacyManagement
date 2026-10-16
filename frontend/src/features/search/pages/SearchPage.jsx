// src/features/search/pages/SearchPage.jsx

import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon, Loader2, Package, Users, Receipt,
  ShoppingBag, Truck, ArrowRight, X
} from 'lucide-react';

import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { useGlobalSearchQuery } from '../searchApi';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const { data: res, isLoading } = useGlobalSearchQuery(
    { q: query, limit: 10 },
    { skip: !query.trim() }
  );

  const results = res?.data;

  return (
    <>
      <PageHeader
        title="Search"
        subtitle={query ? `Results for "${query}"` : 'Search across your entire system'}
      />

      <div className="space-y-6">
        {/* Search input */}
        <Card className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              defaultValue={query}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchParams({ q: e.target.value });
                }
              }}
              placeholder="Search medicines, customers, invoices, suppliers..."
              className="w-full h-12 pl-11 pr-24 rounded-xl bg-muted/40 border border-border focus-visible:bg-background focus-visible:border-accent outline-none text-sm"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setSearchParams({})}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </Card>

        {!query.trim() ? (
          <Card className="p-12 text-center">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">Start typing to search</p>
            <p className="text-xs text-muted-foreground mt-1">
              Search across medicines, customers, suppliers, sales and purchases
            </p>
          </Card>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !results || results.totalCount === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-sm font-medium text-foreground">No results found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try different keywords
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Medicines */}
            {results.medicines?.length > 0 && (
              <ResultSection
                icon={Package}
                title="Medicines"
                count={results.medicines.length}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
              >
                {results.medicines.map((med) => (
                  <ResultRow
                    key={med._id}
                    onClick={() => navigate(`/medicines?search=${encodeURIComponent(med.name)}`)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{med.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {med.strength} • {med.dosageForm}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      Stock: {med.totalStock || 0}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </ResultRow>
                ))}
              </ResultSection>
            )}

            {/* Customers */}
            {results.customers?.length > 0 && (
              <ResultSection
                icon={Users}
                title="Customers"
                count={results.customers.length}
                color="text-blue-500"
                bg="bg-blue-500/10"
              >
                {results.customers.map((c) => (
                  <ResultRow
                    key={c._id}
                    onClick={() => navigate(`/customers?search=${encodeURIComponent(c.name)}`)}
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-500">
                        {getInitials(c.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.phone || c.email || 'No contact'}
                      </p>
                    </div>
                    {c.dueBalance > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        Due: {formatCurrency(c.dueBalance)}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </ResultRow>
                ))}
              </ResultSection>
            )}

            {/* Suppliers */}
            {results.suppliers?.length > 0 && (
              <ResultSection
                icon={Truck}
                title="Suppliers"
                count={results.suppliers.length}
                color="text-orange-500"
                bg="bg-orange-500/10"
              >
                {results.suppliers.map((s) => (
                  <ResultRow
                    key={s._id}
                    onClick={() => navigate(`/suppliers?search=${encodeURIComponent(s.name)}`)}
                  >
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Truck className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.company || s.phone || '—'}
                      </p>
                    </div>
                    {s.dueBalance > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        Due: {formatCurrency(s.dueBalance)}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </ResultRow>
                ))}
              </ResultSection>
            )}

            {/* Sales */}
            {results.sales?.length > 0 && (
              <ResultSection
                icon={Receipt}
                title="Sales Invoices"
                count={results.sales.length}
                color="text-accent"
                bg="bg-accent/10"
              >
                {results.sales.map((s) => (
                  <ResultRow
                    key={s._id}
                    onClick={() => navigate(`/sales?search=${encodeURIComponent(s.invoiceNumber)}`)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Receipt className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.invoiceNumber}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.customerName} • {s.saleDate ? formatDate(s.saleDate) : ''}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrency(s.total)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </ResultRow>
                ))}
              </ResultSection>
            )}

            {/* Purchases */}
            {results.purchases?.length > 0 && (
              <ResultSection
                icon={ShoppingBag}
                title="Purchase Invoices"
                count={results.purchases.length}
                color="text-purple-500"
                bg="bg-purple-500/10"
              >
                {results.purchases.map((p) => (
                  <ResultRow
                    key={p._id}
                    onClick={() => navigate(`/purchases?search=${encodeURIComponent(p.invoiceNumber)}`)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.invoiceNumber}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.supplier?.name || '—'} • {p.purchaseDate ? formatDate(p.purchaseDate) : ''}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrency(p.total)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </ResultRow>
                ))}
              </ResultSection>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ===== Helper Components =====
function ResultSection({ icon: Icon, title, count, color, bg, children }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">
        <div className={cn('rounded-lg p-2 shrink-0', bg)}>
          <Icon className={cn('h-4 w-4', color)} />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {count}
        </Badge>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </Card>
  );
}

function ResultRow({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left"
    >
      {children}
    </button>
  );
}