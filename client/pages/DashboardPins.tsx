import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EditPinDialog from "@/components/dashboard/EditPinDialog";
import { useData } from "@/data/DataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import type { Pin } from "@/types";

const PINS_PER_PAGE = 8;

export default function DashboardPins() {
  const { pins, editPin, removePin, togglePinVisibility } = useData();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Edit dialog
  const [editingPin, setEditingPin] = useState<Pin | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Delete confirmation
  const [deletingPin, setDeletingPin] = useState<Pin | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return pins;
    return pins.filter(
      (p) =>
        p.neighborhood.toLowerCase().includes(q) ||
        p.customer_name.toLowerCase().includes(q) ||
        p.work_type.toLowerCase().includes(q) ||
        p.zip_code.toLowerCase().includes(q)
    );
  }, [pins, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PINS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PINS_PER_PAGE,
    currentPage * PINS_PER_PAGE
  );

  // Reset to page 1 when search changes
  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleEdit(pin: Pin) {
    setEditingPin(pin);
    setEditOpen(true);
  }

  function handleSaveEdit(id: string, updates: Partial<Pin>) {
    editPin(id, updates);
    toast.success("Pin updated successfully!");
  }

  function handleToggleVisibility(pin: Pin) {
    togglePinVisibility(pin.id);
    toast.success(pin.hidden ? "Pin is now visible on the map." : "Pin hidden from the map.");
  }

  function handleDeleteClick(pin: Pin) {
    setDeletingPin(pin);
    setDeleteOpen(true);
  }

  function handleConfirmDelete() {
    if (!deletingPin) return;
    removePin(deletingPin.id);
    toast.success("Pin removed successfully.");
    setDeleteOpen(false);
    setDeletingPin(null);
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Pins</h1>
            <p className="text-sm text-slate-500 mt-1">
              {pins.length} total pin{pins.length !== 1 && "s"} &middot;{" "}
              {pins.filter((p) => p.hidden).length} hidden
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search pins..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MapPin className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">
                {search ? "No pins match your search." : "No pins yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/60">
                      <TableHead className="text-xs font-medium w-[180px]">Neighborhood</TableHead>
                      <TableHead className="text-xs font-medium">Work Type</TableHead>
                      <TableHead className="text-xs font-medium hidden sm:table-cell">Customer</TableHead>
                      <TableHead className="text-xs font-medium hidden md:table-cell">Completed</TableHead>
                      <TableHead className="text-xs font-medium text-center">Status</TableHead>
                      <TableHead className="text-xs font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((pin) => (
                      <TableRow
                        key={pin.id}
                        className={pin.hidden ? "opacity-50" : ""}
                      >
                        <TableCell className="font-medium text-sm text-slate-900">
                          {pin.neighborhood}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                            {pin.work_type}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 hidden sm:table-cell">
                          {pin.privacy_mode ? (
                            <span className="text-slate-400 italic">Private</span>
                          ) : (
                            pin.customer_name || "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 hidden md:table-cell">
                          {pin.date_completed}
                        </TableCell>
                        <TableCell className="text-center">
                          {pin.hidden ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                              <EyeOff className="w-3 h-3" />
                              Hidden
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                              <Eye className="w-3 h-3" />
                              Visible
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-slate-900"
                              onClick={() => handleEdit(pin)}
                              title="Edit pin"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-slate-900"
                              onClick={() => handleToggleVisibility(pin)}
                              title={pin.hidden ? "Show on map" : "Hide from map"}
                            >
                              {pin.hidden ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-red-600"
                              onClick={() => handleDeleteClick(pin)}
                              title="Remove pin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Showing {(currentPage - 1) * PINS_PER_PAGE + 1}–
                    {Math.min(currentPage * PINS_PER_PAGE, filtered.length)} of{" "}
                    {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === currentPage ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 text-xs"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <EditPinDialog
        pin={editingPin}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this pin?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the pin for{" "}
              <span className="font-medium text-slate-700">
                {deletingPin?.neighborhood}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Pin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
