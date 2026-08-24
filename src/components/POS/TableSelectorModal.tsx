"use client";

import { useState, useMemo } from "react";
import {
  X,
  Users,
  Armchair,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Receipt,
  Sparkles,
  ChevronRight,
  Flame,
  UtensilsCrossed,
} from "lucide-react";
import { RestaurantTableItem } from "@/lib/types";
import { formatCurrency, formatShortTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: RestaurantTableItem[];
  selectedTableId?: string | null;
  onSelectTable: (table: RestaurantTableItem) => void;
  onReopenOrder?: (table: RestaurantTableItem, activeOrder: any) => void;
  onRefreshTables?: () => Promise<void>;
}

export default function TableSelectorModal({
  isOpen,
  onClose,
  tables,
  selectedTableId,
  onSelectTable,
  onReopenOrder,
  onRefreshTables,
}: TableSelectorModalProps) {
  const [filter, setFilter] = useState<"ALL" | "AVAILABLE" | "OCCUPIED" | "RESERVED">("ALL");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const availableCount = useMemo(
    () => tables.filter((t) => t.status === "AVAILABLE").length,
    [tables],
  );
  const occupiedCount = useMemo(
    () => tables.filter((t) => t.status === "OCCUPIED").length,
    [tables],
  );
  const reservedCount = useMemo(
    () => tables.filter((t) => t.status === "RESERVED").length,
    [tables],
  );

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchesFilter = filter === "ALL" || t.status === filter;
      const matchesSearch =
        !search.trim() ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        String(t.number).includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [tables, filter, search]);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    if (!onRefreshTables) return;
    setIsRefreshing(true);
    try {
      await onRefreshTables();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <Armchair className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-xl font-extrabold text-slate-100 tracking-tight">
                  Dining Table Floor Management
                </h2>
                <Badge variant="warning" className="hidden sm:inline-flex">
                  Dine-In
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pick a free table to start a new dining order or reopen an
                active bill
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onRefreshTables && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-xl border-slate-800 bg-slate-950 hover:bg-slate-800"
                title="Refresh Table Floor"
              >
                <RefreshCw
                  className={`w-4 h-4 text-amber-400 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="rounded-xl border-slate-800 bg-slate-950 hover:bg-slate-800"
              title="Close Modal"
            >
              <X className="w-5 h-5 text-slate-300" />
            </Button>
          </div>
        </div>

        {/* Filter Bar & Search Controls */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800/90 bg-slate-950/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                filter === "ALL"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>All Tables</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-950/30 text-[10px] font-mono">
                {tables.length}
              </span>
            </button>

            <button
              onClick={() => setFilter("RESERVED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                filter === "RESERVED"
                  ? "bg-violet-500 text-white shadow-md shadow-violet-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-violet-400"></span>
              <span>Reserved</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-950/30 text-[10px] font-mono">
                {reservedCount}
              </span>
            </button>

            <button
              onClick={() => setFilter("AVAILABLE")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                filter === "AVAILABLE"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Available</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-950/30 text-[10px] font-mono">
                {availableCount}
              </span>
            </button>

            <button
              onClick={() => setFilter("OCCUPIED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                filter === "OCCUPIED"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Occupied (Dining)</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-950/30 text-[10px] font-mono">
                {occupiedCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search table or slot #..."
              className="pl-9 bg-slate-900 border-slate-800 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Table Slot Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredTables.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
              <Armchair className="w-12 h-12 stroke-[1.2] text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">
                No tables match your search or filter
              </p>
              <p className="text-xs text-slate-600">
                Try selecting a different status tab above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredTables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const isOccupied = table.status === "OCCUPIED";
                const isReserved = table.status === "RESERVED";
                const isUnavailable = !table.active || isReserved;
                const activeOrder = table.activeOrder;

                return (
                  <div
                    key={table.id}
                    onClick={() => {
                      if (isUnavailable) return;
                      if (isOccupied && activeOrder && onReopenOrder) {
                        onReopenOrder(table, activeOrder);
                      } else {
                        onSelectTable(table);
                      }
                      onClose();
                    }}
                    className={`${isUnavailable ? "cursor-not-allowed opacity-75" : "cursor-pointer"} rounded-2xl p-4 border transition-all duration-200 relative flex flex-col justify-between group select-none ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500"
                        : isOccupied
                          ? "bg-slate-950/90 border-amber-500/40 hover:border-amber-400 hover:bg-slate-950 shadow-md"
                          : isReserved
                            ? "bg-violet-950/20 border-violet-500/40"
                          : "bg-slate-950/70 border-slate-800/80 hover:border-emerald-500/70 hover:bg-slate-900/90 shadow-sm"
                    }`}
                  >
                    {/* Top Row: Table Name & Status Indicator */}
                    <div className="flex items-start justify-between gap-1.5 mb-3">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-100 tracking-tight truncate max-w-[130px]">
                            {table.name}
                          </h3>
                        </div>

                        {/* Capacity visual dots & seat count */}
                        <div className="flex items-center space-x-1.5 mt-1">
                          <div className="flex items-center space-x-0.5">
                            {Array.from({
                              length: Math.min(table.capacity, 8),
                            }).map((_, i) => (
                              <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isOccupied
                                    ? "bg-amber-400/60"
                                    : isReserved
                                      ? "bg-violet-400/60"
                                    : "bg-emerald-400/60"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-medium text-slate-400 font-mono">
                            {table.capacity} Seats
                          </span>
                        </div>
                      </div>

                      {/* Status Chip Badge */}
                      <Badge
                        variant={isOccupied ? "warning" : isReserved ? "secondary" : "success"}
                        className="shrink-0 flex items-center space-x-1"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOccupied
                              ? "bg-amber-400"
                              : isReserved
                                ? "bg-violet-400"
                              : "bg-emerald-400 animate-pulse"
                          }`}
                        />
                        <span>{isOccupied ? "Occupied" : isReserved ? "Reserved" : table.active ? "Available" : "Inactive"}</span>
                      </Badge>
                    </div>

                    {/* Middle / Bottom Content Slot */}
                    {isOccupied && activeOrder ? (
                      <div className="pt-2.5 border-t border-slate-800/90 space-y-2 bg-slate-900/40 -mx-4 -mb-4 p-3 rounded-b-2xl">
                        {/* Order & Bill Overview */}
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {activeOrder.invoiceNo}
                          </span>
                          <span className="font-extrabold text-sm text-amber-400 font-mono">
                            {formatCurrency(activeOrder.grandTotal)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center space-x-1">
                            <UtensilsCrossed className="w-3 h-3 text-slate-500" />
                            <span>{activeOrder.items?.length || 0} Items</span>
                          </span>
                          {activeOrder.createdAt && (
                            <span className="flex items-center space-x-1 font-mono text-slate-400">
                              <Clock className="w-3 h-3 text-amber-400/70" />
                              <span>
                                {formatShortTime(activeOrder.createdAt)}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Action prompt */}
                        <div className="pt-1.5 flex items-center justify-between text-[11px] font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                          <span>Reopen Tab & Append</span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    ) : (
                      <div className={`pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold ${isReserved ? "text-violet-400" : !table.active ? "text-slate-500" : "text-emerald-400 group-hover:text-emerald-300"} transition-colors`}>
                        <span>{isReserved ? "Reserved — unavailable" : !table.active ? "Inactive — unavailable" : "Select Table"}</span>
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                          {isReserved ? <Clock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50"></span>
              <span className="font-semibold text-slate-300">
                Available ({availableCount})
              </span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block"></span>
              <span className="font-semibold text-slate-300">
                Reserved ({reservedCount})
              </span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm shadow-amber-500/50"></span>
              <span className="font-semibold text-slate-300">
                Occupied ({occupiedCount})
              </span>
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-5"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
