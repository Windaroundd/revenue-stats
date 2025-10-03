import type { Request, Response } from "express";
import { RevenueDataModel } from "../models/RevenueData";

// Get week comparison (current vs previous)
export const getWeekComparison = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { year, weekNumber } = req.query;

    if (!year || !weekNumber) {
      res.status(400).json({ error: "Year and weekNumber are required" });
      return;
    }

    const currentYear = parseInt(year as string);
    const currentWeek = parseInt(weekNumber as string);

    // Calculate previous week (handling year boundary)
    let previousWeek = currentWeek - 1;
    let previousYear = currentYear;

    if (previousWeek === 0) {
      previousYear = currentYear - 1;
      // Get last week of previous year (approximately 52)
      previousWeek = 52;
    }

    // Get current week data
    const currentWeekData = await RevenueDataModel.find({
      year: currentYear,
      weekNumber: currentWeek,
    }).sort({ date: 1 });

    // Get previous week data
    const previousWeekData = await RevenueDataModel.find({
      year: previousYear,
      weekNumber: previousWeek,
    }).sort({ date: 1 });

    // Calculate aggregates for current week
    const currentStats = calculateWeekStats(currentWeekData);
    const previousStats = calculateWeekStats(previousWeekData);

    // Calculate percentage changes
    const totalRevenueChange = calculatePercentageChange(
      previousStats.totalRevenue,
      currentStats.totalRevenue
    );
    const averagePerDayChange = calculatePercentageChange(
      previousStats.averagePerDay,
      currentStats.averagePerDay
    );
    const totalCoversChange = calculatePercentageChange(
      previousStats.totalCovers,
      currentStats.totalCovers
    );

    res.json({
      currentWeek: {
        year: currentYear,
        weekNumber: currentWeek,
        data: currentWeekData,
        stats: currentStats,
      },
      previousWeek: {
        year: previousYear,
        weekNumber: previousWeek,
        data: previousWeekData,
        stats: previousStats,
      },
      comparison: {
        totalRevenueChange,
        averagePerDayChange,
        totalCoversChange,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching week comparison" });
  }
};

// Get analytics for a specific date range
export const getAnalyticsByDateRange = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: "startDate and endDate are required" });
      return;
    }

    const data = await RevenueDataModel.find({
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    }).sort({ date: 1 });

    const stats = calculateWeekStats(data);

    res.json({
      dateRange: {
        startDate,
        endDate,
      },
      data,
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching analytics" });
  }
};

// Get current week analytics (default endpoint for frontend)
export const getCurrentWeekAnalytics = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();

    // Get current week data
    const currentWeekData = await RevenueDataModel.find({
      year,
      weekNumber,
    }).sort({ date: 1 });

    // Get previous week data
    let previousWeek = weekNumber - 1;
    let previousYear = year;

    if (previousWeek === 0) {
      previousYear = year - 1;
      previousWeek = 52;
    }

    const previousWeekData = await RevenueDataModel.find({
      year: previousYear,
      weekNumber: previousWeek,
    }).sort({ date: 1 });

    // Calculate stats
    const currentStats = calculateWeekStats(currentWeekData);
    const previousStats = calculateWeekStats(previousWeekData);

    // Calculate percentage changes
    const totalRevenueChange = calculatePercentageChange(
      previousStats.totalRevenue,
      currentStats.totalRevenue
    );
    const averagePerDayChange = calculatePercentageChange(
      previousStats.averagePerDay,
      currentStats.averagePerDay
    );
    const totalCoversChange = calculatePercentageChange(
      previousStats.totalCovers,
      currentStats.totalCovers
    );

    res.json({
      currentWeek: {
        year,
        weekNumber,
        data: currentWeekData,
        stats: currentStats,
      },
      previousWeek: {
        year: previousYear,
        weekNumber: previousWeek,
        data: previousWeekData,
        stats: previousStats,
      },
      comparison: {
        totalRevenueChange,
        averagePerDayChange,
        totalCoversChange,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching current week analytics" });
  }
};

// Get summary statistics
export const getSummaryStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await RevenueDataModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $add: ["$posRevenue", "$eatclubRevenue"] },
          },
          totalPosRevenue: { $sum: "$posRevenue" },
          totalEatclubRevenue: { $sum: "$eatclubRevenue" },
          totalLabourCosts: { $sum: "$labourCosts" },
          totalCovers: { $sum: "$totalCovers" },
          averageRevenue: {
            $avg: { $add: ["$posRevenue", "$eatclubRevenue"] },
          },
          averageCovers: { $avg: "$totalCovers" },
          recordCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      stats: stats.length > 0 ? stats[0] : null,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching summary stats" });
  }
};

// Helper functions
function calculateWeekStats(data: Array<{ posRevenue: number; eatclubRevenue: number; labourCosts: number; totalCovers: number }>) {
  if (data.length === 0) {
    return {
      totalRevenue: 0,
      totalPosRevenue: 0,
      totalEatclubRevenue: 0,
      totalLabourCosts: 0,
      totalCovers: 0,
      averagePerDay: 0,
      averageCoversPerDay: 0,
      daysCount: 0,
    };
  }

  const totalPosRevenue = data.reduce((sum, d) => sum + d.posRevenue, 0);
  const totalEatclubRevenue = data.reduce((sum, d) => sum + d.eatclubRevenue, 0);
  const totalLabourCosts = data.reduce((sum, d) => sum + d.labourCosts, 0);
  const totalCovers = data.reduce((sum, d) => sum + d.totalCovers, 0);
  const totalRevenue = totalPosRevenue + totalEatclubRevenue;

  return {
    totalRevenue,
    totalPosRevenue,
    totalEatclubRevenue,
    totalLabourCosts,
    totalCovers,
    averagePerDay: totalRevenue / data.length,
    averageCoversPerDay: totalCovers / data.length,
    daysCount: data.length,
  };
}

function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
