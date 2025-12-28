'use client';

import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }>;
}

export function TableActions({
  onView,
  onEdit,
  onDelete,
  customActions,
}: TableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="hover:bg-wds-accent/10 h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="text-wds-text h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-wds-accent/30 bg-wds-background text-wds-text"
      >
        {onView && (
          <DropdownMenuItem
            onClick={onView}
            className="focus:bg-wds-accent/10 focus:text-wds-text"
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            onClick={onEdit}
            className="focus:bg-wds-accent/10 focus:text-wds-text"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {customActions && customActions.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-wds-accent/20" />
            {customActions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={action.onClick}
                variant={action.variant}
                className="focus:bg-wds-accent/10 focus:text-wds-text"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            ))}
          </>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator className="bg-wds-accent/20" />
            <DropdownMenuItem
              onClick={onDelete}
              variant="destructive"
              className="focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
