// src/components/ui/Table.tsx
import React, { ReactNode } from 'react'; // Import React
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

// --- Table Component ---
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}
const Table = React.forwardRef<HTMLTableElement, TableProps>(
 ({ children, className, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <table
          ref={ref}
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);
Table.displayName = 'Table';

// --- Table Header ---
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> // Use base type directly
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b bg-gray-50 border-gray-200', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

// --- Table Body ---
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> // Use base type directly
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0 divide-y divide-gray-200', className)} {...props} />
));
TableBody.displayName = 'TableBody';

// --- Table Row ---
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-state'?: 'selected' | string;
}
const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, onClick, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-100',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        {...props}
      >{children}</tr> // No whitespace
    );
  }
);
TableRow.displayName = 'TableRow';

// --- Table Head Cell ---
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}
const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable = false, sortDirection, onSort, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0',
          sortable && 'cursor-pointer select-none hover:bg-gray-100',
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && (
            <span className="inline-flex flex-col items-center justify-center w-4 h-4 text-gray-400">
              <ArrowUp className={`w-3 h-3 ${sortDirection === 'asc' ? 'text-indigo-600' : 'text-gray-300'}`} />
              <ArrowDown className={`w-3 h-3 -mt-1 ${sortDirection === 'desc' ? 'text-indigo-600' : 'text-gray-300'}`} />
            </span>
          )}
        </div>
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

// --- Table Cell ---
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> // Use base type directly
>(({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0 text-sm text-gray-700', className)}
        {...props}
      >
        {children}
      </td>
    );
  }
);
TableCell.displayName = 'TableCell';

// --- Exports ---
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
};
