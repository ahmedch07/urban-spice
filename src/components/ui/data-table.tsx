import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  header: React.ReactNode | string;
  accessorKey?: keyof T | string;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string | React.ReactNode;
  keyExtractor?: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  loadingMessage = "Loading data...",
  emptyMessage = "No records found.",
  keyExtractor,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-800 bg-slate-950 hover:bg-slate-950">
            {columns.map((col, idx) => {
              const alignClass =
                col.align === "right"
                  ? "text-right"
                  : col.align === "center"
                  ? "text-center"
                  : "text-left";

              return (
                <TableHead
                  key={idx}
                  className={cn(alignClass, col.headerClassName)}
                >
                  {col.header}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="p-8 text-center text-slate-500 font-medium"
              >
                {loadingMessage}
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="p-8 text-center text-slate-500 font-medium"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => {
              const key = keyExtractor
                ? keyExtractor(row, rowIdx)
                : row.id || rowIdx;

              return (
                <TableRow
                  key={key}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    "hover:bg-slate-800/50 transition-colors"
                  )}
                >
                  {columns.map((col, colIdx) => {
                    const alignClass =
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left";

                    const content = col.cell
                      ? col.cell(row, rowIdx)
                      : col.accessorKey
                      ? row[col.accessorKey as string]
                      : null;

                    return (
                      <TableCell
                        key={colIdx}
                        className={cn(alignClass, col.className)}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
