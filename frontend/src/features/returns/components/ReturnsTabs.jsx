import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TABS = [
  { value: 'sales', label: 'Sales Returns' },
  { value: 'purchase', label: 'Purchase Returns' }
];

export default function ReturnsTabs({ value, onValueChange }) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="w-full justify-start overflow-x-auto scrollbar-thin h-auto p-1 bg-transparent border-b border-border rounded-none">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => {
              console.log('[ReturnsTabs] Clicked:', tab.value);
              onValueChange?.(tab.value);
            }}
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none px-4 whitespace-nowrap"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}