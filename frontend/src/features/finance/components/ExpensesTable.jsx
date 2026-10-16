import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import DataTable from '@/components/common/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '../financeTypes';

export default function ExpensesTable({
  data,
  isLoading,
  onView,
  onEdit,
  onDelete
}) {
  const getCategoryLabel = (val) => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === val);
    return cat?.label || val;
  };

  const columns = [
    {
      key: 'expenseNumber',
      label: 'Reference',
      render: (row) => (
        <span className="text-sm font-mono font-medium text-foreground">
          {row.expenseNumber}
        </span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <Badge variant="secondary" className="capitalize">
          {getCategoryLabel(row.category)}
        </Badge>
      )
    },
    {
      key: 'title',
      label: 'Title',
      render: (row) => (
        <span className="text-sm text-foreground truncate max-w-[200px] inline-block">
          {row.title}
        </span>
      )
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <span className="text-sm capitalize text-muted-foreground">
          {row.paymentMethod}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDate(row.date)}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="text-sm font-semibold text-destructive tabular-nums">
          {formatCurrency(row.amount)}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(row)}>
              <Eye className="h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row)}>
              <Edit className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(row)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyTitle="No expenses found"
      emptyDescription="Try adjusting your filters or add a new expense."
      minWidth="1000px"
    />
  );
}