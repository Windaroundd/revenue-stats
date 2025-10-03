import { Router } from "express";
import {
  getWeekComparison,
  getAnalyticsByDateRange,
  getCurrentWeekAnalytics,
  getSummaryStats,
} from "../controllers/analyticsController";

const router = Router();

/**
 * @swagger
 * /api/analytics/current-week:
 *   get:
 *     tags: [Analytics]
 *     summary: Get current week analytics vs previous week
 *     description: Returns current week revenue data compared with previous week including percentage changes
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentWeek:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                     weekNumber:
 *                       type: integer
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RevenueData'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                         totalPosRevenue:
 *                           type: number
 *                         totalEatclubRevenue:
 *                           type: number
 *                         totalLabourCosts:
 *                           type: number
 *                         totalCovers:
 *                           type: integer
 *                         averagePerDay:
 *                           type: number
 *                         averageCoversPerDay:
 *                           type: number
 *                         daysCount:
 *                           type: integer
 *                 previousWeek:
 *                   type: object
 *                 comparison:
 *                   type: object
 *                   properties:
 *                     totalRevenueChange:
 *                       type: number
 *                       description: Percentage change
 *                     averagePerDayChange:
 *                       type: number
 *                       description: Percentage change
 *                     totalCoversChange:
 *                       type: number
 *                       description: Percentage change
 *       500:
 *         description: Server error
 */
router.get("/current-week", getCurrentWeekAnalytics);

/**
 * @swagger
 * /api/analytics/week-comparison:
 *   get:
 *     tags: [Analytics]
 *     summary: Compare specific week with previous week
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year
 *         example: 2025
 *       - in: query
 *         name: weekNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: ISO week number
 *         example: 40
 *     responses:
 *       200:
 *         description: Week comparison data
 *       400:
 *         description: Missing year or weekNumber
 *       500:
 *         description: Server error
 */
router.get("/week-comparison", getWeekComparison);

/**
 * @swagger
 * /api/analytics/date-range:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics for a specific date range
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *         example: 2025-09-01
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *         example: 2025-09-30
 *     responses:
 *       200:
 *         description: Date range analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                     endDate:
 *                       type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RevenueData'
 *                 stats:
 *                   type: object
 *       400:
 *         description: Missing startDate or endDate
 *       500:
 *         description: Server error
 */
router.get("/date-range", getAnalyticsByDateRange);

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Get overall summary statistics
 *     description: Returns aggregated statistics across all revenue data
 *     responses:
 *       200:
 *         description: Summary statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                     totalPosRevenue:
 *                       type: number
 *                     totalEatclubRevenue:
 *                       type: number
 *                     totalLabourCosts:
 *                       type: number
 *                     totalCovers:
 *                       type: integer
 *                     averageRevenue:
 *                       type: number
 *                     averageCovers:
 *                       type: number
 *                     recordCount:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get("/summary", getSummaryStats);

export default router;
