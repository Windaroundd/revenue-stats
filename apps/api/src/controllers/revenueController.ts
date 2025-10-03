import type { Response } from "express";
import { validationResult } from "express-validator";
import { RevenueDataModel } from "../models/RevenueData";
import type { AuthRequest } from "../middleware/auth";

// Helper function to get week number
const getWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

// Helper function to get day of week
const getDayOfWeek = (date: Date): "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  const day = days[date.getDay()];
  if (!day) throw new Error("Invalid day");
  return day;
};

// Create revenue data
export const createRevenueData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { date, posRevenue, eatclubRevenue, labourCosts, totalCovers, events } =
      req.body;

    const dateObj = new Date(date);
    const weekNumber = getWeekNumber(dateObj);
    const dayOfWeek = getDayOfWeek(dateObj);
    const year = dateObj.getFullYear();

    // Check if data already exists for this date
    const existingData = await RevenueDataModel.findOne({ date: dateObj });
    if (existingData) {
      res.status(409).json({ error: "Revenue data already exists for this date" });
      return;
    }

    const revenueData = new RevenueDataModel({
      date: dateObj,
      dayOfWeek,
      posRevenue,
      eatclubRevenue,
      labourCosts,
      totalCovers,
      events,
      weekNumber,
      year,
    });

    await revenueData.save();

    res.status(201).json({
      message: "Revenue data created successfully",
      data: revenueData,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error creating revenue data" });
  }
};

// Get all revenue data with pagination and filtering
export const getRevenueData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { year, weekNumber, startDate, endDate, page = 1, limit = 100 } = req.query;

    // Build query
    const query: Record<string, unknown> = {};

    if (year) {
      query.year = parseInt(year as string);
    }

    if (weekNumber) {
      query.weekNumber = parseInt(weekNumber as string);
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, unknown>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (query.date as Record<string, unknown>).$lte = new Date(endDate as string);
      }
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [data, total] = await Promise.all([
      RevenueDataModel.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      RevenueDataModel.countDocuments(query),
    ]);

    res.json({
      data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching revenue data" });
  }
};

// Get single revenue data by ID
export const getRevenueDataById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const revenueData = await RevenueDataModel.findById(id);

    if (!revenueData) {
      res.status(404).json({ error: "Revenue data not found" });
      return;
    }

    res.json({ data: revenueData });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching revenue data" });
  }
};

// Update revenue data
export const updateRevenueData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { posRevenue, eatclubRevenue, labourCosts, totalCovers, events } = req.body;

    const revenueData = await RevenueDataModel.findById(id);

    if (!revenueData) {
      res.status(404).json({ error: "Revenue data not found" });
      return;
    }

    // Update fields
    if (posRevenue !== undefined) revenueData.posRevenue = posRevenue;
    if (eatclubRevenue !== undefined) revenueData.eatclubRevenue = eatclubRevenue;
    if (labourCosts !== undefined) revenueData.labourCosts = labourCosts;
    if (totalCovers !== undefined) revenueData.totalCovers = totalCovers;
    if (events !== undefined) revenueData.events = events;

    await revenueData.save();

    res.json({
      message: "Revenue data updated successfully",
      data: revenueData,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error updating revenue data" });
  }
};

// Delete revenue data
export const deleteRevenueData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const revenueData = await RevenueDataModel.findByIdAndDelete(id);

    if (!revenueData) {
      res.status(404).json({ error: "Revenue data not found" });
      return;
    }

    res.json({ message: "Revenue data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error deleting revenue data" });
  }
};

// Bulk create revenue data
export const bulkCreateRevenueData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({ error: "Data must be a non-empty array" });
      return;
    }

    const processedData = data.map((item) => {
      const dateObj = new Date(item.date);
      return {
        ...item,
        date: dateObj,
        dayOfWeek: getDayOfWeek(dateObj),
        weekNumber: getWeekNumber(dateObj),
        year: dateObj.getFullYear(),
      };
    });

    const result = await RevenueDataModel.insertMany(processedData, {
      ordered: false,
    });

    res.status(201).json({
      message: "Bulk revenue data created successfully",
      count: result.length,
      data: result,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({
        error: "Some revenue data already exists for the provided dates",
      });
      return;
    }
    res.status(500).json({ error: "Server error creating bulk revenue data" });
  }
};
