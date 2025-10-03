"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BarChart3, Download, TrendingUp, TrendingDown } from "lucide-react";
import { analyticsService } from "../lib/services/analyticsService";
import type { CurrentWeekAnalyticsResponse, RevenueData } from "../types/api";
import { formatCurrency, formatNumber, formatPercentage } from "../lib/utils";
import { toPng } from "html-to-image";

export default function RevenuePage() {
  const [data, setData] = useState<CurrentWeekAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState({
    posRevenue: true,
    eatclubRevenue: true,
    labourCosts: true,
  });
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getCurrentWeekAnalytics();

      setData(response);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPNG = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current, {
          quality: 1,
          pixelRatio: 2,
        });
        const link = document.createElement("a");
        link.download = `revenue-chart-${new Date().toISOString().split("T")[0]}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Failed to export chart:", error);
      }
    }
  };

  const prepareChartData = () => {
    if (!data) return [];

    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentWeekMap = new Map(
      data.currentWeek.data.map((d) => [d.dayOfWeek, d])
    );
    const previousWeekMap = new Map(
      data.previousWeek?.data.map((d) => [d.dayOfWeek, d]) || []
    );

    return dayOrder.map((day) => {
      const current = currentWeekMap.get(day as RevenueData["dayOfWeek"]);
      const previous = previousWeekMap.get(day as RevenueData["dayOfWeek"]);

      const chartData: Record<string, number | string> = {
        day,
        posRevenue: current?.posRevenue || 0,
        eatclubRevenue: current?.eatclubRevenue || 0,
        labourCosts: current?.labourCosts || 0,
      };

      if (showComparison && data.previousWeek) {
        chartData.posRevenuePrev = previous?.posRevenue || 0;
        chartData.eatclubRevenuePrev = previous?.eatclubRevenue || 0;
        chartData.totalRevenuePrev =
          (previous?.posRevenue || 0) + (previous?.eatclubRevenue || 0);
        chartData.labourCostsPrev = previous?.labourCosts || 0;
      }

      return chartData;
    });
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
      dataKey: string;
    }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600">{entry.name}:</span>
            <span className="font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };
  const CustomLegend = ({ payload }: any) => {
    console.log("payload: ", payload);

    // Filter out event impact items and define the correct order
    const orderedLegendItems = [
      "POS Revenue (Current)",
      "Eatclub Revenue (Current)",
      "Labour Costs (Current)",
      "Direct Revenue (Previous)",
      "Total Revenue (Previous)",
      "Labour Costs (Previous)",
    ];

    // Filter and sort payload according to the desired order
    const filteredPayload = orderedLegendItems
      .map((name) => payload.find((entry: any) => entry.value === name))
      .filter(Boolean);

    return (
      <div className="flex justify-center gap-5 pt-5 items-center flex-wrap">
        {filteredPayload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-base text-slate-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8">
          <p className="text-slate-600">No data available</p>
        </Card>
      </div>
    );
  }

  const chartData = prepareChartData();
  const currentStats = data.currentWeek.stats;
  const comparison = data.comparison;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-[90rem] mx-auto space-y-6 rounded-xl border border-slate-200 bg-white text-slate-950 shadow dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 p-4">
        {/* Header */}
        <div className="flex items-center justify-between ">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 max-w-[25rem]">
              {showComparison
                ? "This Week's Revenue Trend vs Previous Period"
                : "This Week's Revenue Trend"}
            </h1>
            <p className="text-slate-600">
              Week {data.currentWeek.weekNumber}, {data.currentWeek.year}
            </p>
          </div>

          {/* Legend Controls */}
          <div className="">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pos"
                  checked={visibleSeries.posRevenue}
                  onCheckedChange={(checked: boolean) =>
                    setVisibleSeries((prev) => ({
                      ...prev,
                      posRevenue: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="pos"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-6 h-1 bg-black rounded" />
                  POS Revenue
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="eatclub"
                  checked={visibleSeries.eatclubRevenue}
                  onCheckedChange={(checked: boolean) =>
                    setVisibleSeries((prev) => ({
                      ...prev,
                      eatclubRevenue: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="eatclub"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-6 h-1 bg-indigo-500 rounded" />
                  Eatclub Revenue
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="labour"
                  checked={visibleSeries.labourCosts}
                  onCheckedChange={(checked: boolean) =>
                    setVisibleSeries((prev) => ({
                      ...prev,
                      labourCosts: !!checked,
                    }))
                  }
                />
                <Label
                  htmlFor="labour"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-6 h-1 bg-orange-500 rounded" />
                  Labour Costs
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <Button
              variant={showComparison ? "compare_default" : "compare_outline"}
              onClick={() => setShowComparison(!showComparison)}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Compare to Previous
            </Button>
            <Button variant="outline" onClick={exportToPNG} className="gap-2">
              <Download className="w-4 h-4" />
              Export PNG
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-100 rounded-xl">
            <div className="space-y-2">
              <p className="text-base text-slate-600">Total Revenue</p>
              <div className="flex gap-3 items-center">
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(currentStats.totalRevenue)}
                </p>
                {showComparison && data.previousWeek && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-600">
                      vs {formatCurrency(data.previousWeek.stats.totalRevenue)}
                    </span>
                    <span
                      className={`text-base font-medium flex items-center gap-1 ${
                        comparison.totalRevenueChange >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ({formatPercentage(comparison.totalRevenueChange)})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-xl">
            <div className="space-y-2">
              <p className="text-base text-slate-600">Average per Day</p>
              <div className="flex gap-3 items-center">
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(currentStats.averagePerDay)}
                </p>
                {showComparison && data.previousWeek && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-600">
                      vs {formatCurrency(data.previousWeek.stats.averagePerDay)}
                    </span>
                    <span
                      className={`text-base font-medium flex items-center gap-1 ${
                        comparison.averagePerDayChange >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      <span
                        className={`text-base font-medium flex items-center gap-1 ${
                          comparison.totalRevenueChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ({formatPercentage(comparison.averagePerDayChange)})
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-xl">
            <div className="space-y-2">
              <p className="text-base text-slate-600">Total Covers</p>
              <div className="flex gap-3 items-center">
                <p className="text-3xl font-bold text-slate-900">
                  {formatNumber(currentStats.totalCovers)}
                </p>
                {showComparison && data.previousWeek && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-600">
                      vs {formatNumber(data.previousWeek.stats.totalCovers)}
                    </span>
                    <span
                      className={`text-base font-medium flex items-center gap-1 ${
                        comparison.totalCoversChange >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      <span
                        className={`text-base font-medium flex items-center gap-1 ${
                          comparison.totalRevenueChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ({formatPercentage(comparison.totalCoversChange)})
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div ref={chartRef} className="p-6">
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={chartData} barGap={0} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748b" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                />
                <YAxis
                  tick={{ fill: "#64748b" }}
                  tickLine={{ stroke: "#cbd5e1" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />

                {/* Current Week Bars */}
                {visibleSeries.posRevenue && (
                  <Bar
                    dataKey="posRevenue"
                    name="POS Revenue (Current)"
                    fill="#0f172a"
                    stackId={showComparison ? "current" : "main"}
                    radius={[0, 0, 0, 0]}
                  />
                )}
                {visibleSeries.eatclubRevenue && (
                  <Bar
                    dataKey="eatclubRevenue"
                    name="Eatclub Revenue (Current)"
                    fill="#6366f1"
                    stackId={showComparison ? "current" : "main"}
                    radius={[4, 4, 0, 0]}
                  />
                )}
                {visibleSeries.labourCosts && (
                  <Bar
                    dataKey="labourCosts"
                    name="Labour Costs (Current)"
                    fill="#f97316"
                    stackId="costs"
                    radius={[4, 4, 0, 0]}
                  />
                )}

                {/* Previous Week Bars */}
                {showComparison && data.previousWeek && (
                  <>
                    {visibleSeries.posRevenue && (
                      <Bar
                        dataKey="posRevenuePrev"
                        name="Direct Revenue (Previous)"
                        fill="#94a3b8"
                        stackId="previous"
                        radius={[0, 0, 0, 0]}
                      />
                    )}
                    {visibleSeries.eatclubRevenue && (
                      <Bar
                        dataKey="eatclubRevenuePrev"
                        name="Total Revenue (Previous)"
                        fill="#c7d2fe"
                        stackId="previous"
                        radius={[4, 4, 0, 0]}
                      />
                    )}
                    {visibleSeries.labourCosts && (
                      <Bar
                        dataKey="labourCostsPrev"
                        name="Labour Costs (Previous)"
                        fill="#fed7aa"
                        stackId="costsPrev"
                        radius={[4, 4, 0, 0]}
                      />
                    )}
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
