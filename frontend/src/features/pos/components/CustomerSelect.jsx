
import { User } from 'lucide-react';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useGetCustomersQuery } from '../posApi';

export default function CustomerSelect({ value, onChange }) {
  const { data: customersRes } = useGetCustomersQuery({ limit: 100 });
  const customers = customersRes?.data?.customers || [];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Customer
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[10px] text-accent hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <Select
        value={value?._id || 'walkin'}
        onValueChange={(v) => {
          if (v === 'walkin') {
            onChange(null);
          } else {
            const customer = customers.find((c) => c._id === v);
            onChange(customer);
          }
        }}
      >
        <SelectTrigger className="h-10">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Walk-in customer" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="walkin">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Walk-in customer
            </div>
          </SelectItem>
          {customers.map((c) => (
            <SelectItem key={c._id} value={c._id}>
              {c.name} {c.phone ? `— ${c.phone}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value && (
        <p className="text-[10px] text-muted-foreground">
          Due balance:{' '}
          <span className={value.dueBalance > 0 ? 'text-warning font-medium' : ''}>
            ৳{value.dueBalance || 0}
          </span>
        </p>
      )}
    </div>
  );
}