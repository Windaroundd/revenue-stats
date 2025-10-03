"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { revenueService } from "@/app/lib/services/revenueService";
import type { RevenueData, CreateRevenueRequest } from "@/app/types/api";
import { isAuthenticated, clearAuthData } from "@/app/lib/utils/auth";
import {
  Plus,
  LogOut,
  Trash2,
  Edit,
  BarChart3,
  Calendar,
  DollarSign,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/app/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RevenueData | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState<CreateRevenueRequest>({
    date: "",
    posRevenue: 0,
    eatclubRevenue: 0,
    labourCosts: 0,
    totalCovers: 0,
    events: [],
  });
  const [eventInput, setEventInput] = useState<{
    name: string;
    impact: "positive" | "negative";
  }>({ name: "", impact: "positive" });

  useEffect(() => {
    checkAuth();
    loadRevenueData();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadRevenueData(page, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    loadRevenueData(1, newPageSize);
  };

  const checkAuth = () => {
    if (!isAuthenticated()) {
      router.push("/admin/login");
    }
  };

  const loadRevenueData = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setLoading(true);
      const response = await revenueService.getRevenueData({ 
        page, 
        limit: size 
      });
      setRevenueData(response.data);
      setTotalRecords(response.pagination.total);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.error("Failed to load revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    router.push("/admin/login");
  };

  const handleOpenDialog = (item?: RevenueData) => {
    if (item) {
      setEditingItem(item);
      const dateStr = new Date(item.date).toISOString().split("T")[0];
      setFormData({
        date: dateStr || "",
        posRevenue: item.posRevenue,
        eatclubRevenue: item.eatclubRevenue,
        labourCosts: item.labourCosts,
        totalCovers: item.totalCovers,
        events: item.events || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        date: "",
        posRevenue: 0,
        eatclubRevenue: 0,
        labourCosts: 0,
        totalCovers: 0,
        events: [],
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await revenueService.updateRevenueData(editingItem._id, formData);
      } else {
        await revenueService.createRevenueData(formData);
      }
      setDialogOpen(false);
      loadRevenueData(currentPage, pageSize);
    } catch (error) {
      console.error("Failed to save revenue data:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      await revenueService.deleteRevenueData(id);
      loadRevenueData(currentPage, pageSize);
    } catch (error) {
      console.error("Failed to delete revenue data:", error);
      alert("Failed to delete data. Please try again.");
    }
  };

  const handleAddEvent = () => {
    if (eventInput.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        events: [
          ...(prev.events || []),
          {
            name: eventInput.name,
            impact: eventInput.impact,
          },
        ],
      }));
      setEventInput({ name: "", impact: "positive" });
    }
  };

  const handleRemoveEvent = (index: number) => {
    setFormData((prev: CreateRevenueRequest) => ({
      ...prev,
      events: prev.events?.filter((_: unknown, i: number) => i !== index) || [],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-600">Revenue Data Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/revenue")}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              View Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Revenue Records
              </h2>
              <p className="text-slate-600">
                Manage daily revenue data
                {totalRecords > 0 && (
                  <span className="ml-2 text-sm">
                    ({totalRecords} total records)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSize" className="text-sm text-slate-600">
                  Show:
                </Label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-slate-200 rounded-md px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                onClick={() => handleOpenDialog()}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 h-9 px-4 py-2"
              >
                <Plus className="w-4 h-4" />
                Add Revenue Data
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Edit Revenue Data" : "Add Revenue Data"}
                  </DialogTitle>
                  <DialogDescription>
                    Enter the revenue details for a specific date
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prev: CreateRevenueRequest) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="posRevenue">POS Revenue</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <Input
                          id="posRevenue"
                          type="number"
                          value={formData.posRevenue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData((prev: CreateRevenueRequest) => ({
                              ...prev,
                              posRevenue: parseFloat(e.target.value),
                            }))
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eatclubRevenue">Eatclub Revenue</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <Input
                          id="eatclubRevenue"
                          type="number"
                          value={formData.eatclubRevenue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData((prev: CreateRevenueRequest) => ({
                              ...prev,
                              eatclubRevenue: parseFloat(e.target.value),
                            }))
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="labourCosts">Labour Costs</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <Input
                          id="labourCosts"
                          type="number"
                          value={formData.labourCosts}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData((prev: CreateRevenueRequest) => ({
                              ...prev,
                              labourCosts: parseFloat(e.target.value),
                            }))
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalCovers">Total Covers</Label>
                      <Input
                        id="totalCovers"
                        type="number"
                        value={formData.totalCovers}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prev: CreateRevenueRequest) => ({
                            ...prev,
                            totalCovers: parseInt(e.target.value),
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Events Section */}
                  <div className="space-y-2">
                    <Label>Events (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Event name"
                        value={eventInput.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEventInput((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                      <select
                        value={eventInput.impact}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setEventInput((prev) => ({
                            ...prev,
                            impact: e.target.value as "positive" | "negative",
                          }))
                        }
                        className="border border-slate-200 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                      </select>
                      <Button type="button" onClick={handleAddEvent} size="sm">
                        Add
                      </Button>
                    </div>
                    {formData.events && formData.events.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {formData.events.map(
                          (
                            event: {
                              name: string;
                              impact: "positive" | "negative";
                            },
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-slate-50 p-2 rounded"
                            >
                              <span className="text-sm">
                                {event.name}{" "}
                                <span
                                  className={`text-xs ${
                                    event.impact === "positive"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  ({event.impact})
                                </span>
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEvent(index)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingItem ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Data</CardTitle>
              <CardDescription>
                All revenue records sorted by date (most recent first)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                  <p className="text-slate-600 mt-2">Loading data...</p>
                </div>
              ) : revenueData.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <p>No revenue data available</p>
                  <p className="text-sm mt-1">
                    Click "Add Revenue Data" to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>POS Revenue</TableHead>
                      <TableHead>Eatclub Revenue</TableHead>
                      <TableHead>Labour Costs</TableHead>
                      <TableHead>Covers</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueData.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          {new Date(item.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{item.dayOfWeek}</TableCell>
                        <TableCell>{formatCurrency(item.posRevenue)}</TableCell>
                        <TableCell>
                          {formatCurrency(item.eatclubRevenue)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(item.labourCosts)}
                        </TableCell>
                        <TableCell>{formatNumber(item.totalCovers)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {((currentPage - 1) * pageSize) + 1} to{" "}
                {Math.min(currentPage * pageSize, totalRecords)} of{" "}
                {totalRecords} results
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
