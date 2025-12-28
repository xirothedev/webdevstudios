/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps {
  columns: Array<{
    id: string;
    label: string;
    accessor?: string | ((row: any) => React.ReactNode);
  }>;
  data: any[];
  visibleColumns: string[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  data,
  visibleColumns,
  isLoading = false,
  emptyMessage = 'No data available',
}: DataTableProps) {
  const visibleColumnsData = columns.filter((col) =>
    visibleColumns.includes(col.id)
  );

  if (isLoading) {
    return (
      <div className="border-wds-accent/30 bg-wds-background rounded-2xl border p-8 text-center">
        <div className="text-wds-text/70">Đang tải...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border-wds-accent/30 bg-wds-background rounded-2xl border p-8 text-center">
        <div className="text-wds-text/70">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="border-wds-accent/30 bg-wds-background shadow-wds-accent/10 rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow className="border-wds-accent/20 hover:bg-wds-accent/5">
            {visibleColumnsData.map((column) => (
              <TableHead
                key={column.id}
                className="text-wds-text font-semibold"
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="border-wds-accent/20 hover:bg-wds-accent/10 transition-colors"
            >
              {visibleColumnsData.map((column) => (
                <TableCell key={column.id} className="text-wds-text/90">
                  {column.accessor
                    ? typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : row[column.accessor]
                    : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
