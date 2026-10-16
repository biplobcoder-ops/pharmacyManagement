import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TABS = [
  { value: 'stock', label: 'Current stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'expiring', label: 'Expiring soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'movements', label: 'Movement ledger' }
];

export default function InventoryTabs({ value, onValueChange, counts = {} }) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="w-full justify-start overflow-x-auto scrollbar-thin h-auto p-1 bg-transparent border-b border-border rounded-none">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none px-4 whitespace-nowrap"
          >
            {tab.label}
            {counts[tab.value] !== undefined && counts[tab.value] > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                {counts[tab.value]}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}