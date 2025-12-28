'use client';

import { Columns3 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Column {
  id: string;
  label: string;
}

interface ColumnVisibilityToggleProps {
  columns: Column[];
  visibleColumns: string[];
  onVisibilityChange: (visibleColumns: string[]) => void;
}

export function ColumnVisibilityToggle({
  columns,
  visibleColumns,
  onVisibilityChange,
}: ColumnVisibilityToggleProps) {
  const [open, setOpen] = useState(false);

  const toggleColumn = (columnId: string) => {
    if (visibleColumns.includes(columnId)) {
      onVisibilityChange(visibleColumns.filter((id) => id !== columnId));
    } else {
      onVisibilityChange([...visibleColumns, columnId]);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10"
        >
          <Columns3 className="h-4 w-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-wds-accent/30 bg-wds-background text-wds-text w-48"
      >
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-wds-accent/20" />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibleColumns.includes(column.id)}
            onCheckedChange={() => toggleColumn(column.id)}
            className="focus:bg-wds-accent/10 focus:text-wds-text"
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
