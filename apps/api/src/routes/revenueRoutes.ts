import { Router } from "express";
import { body } from "express-validator";
import {
  createRevenueData,
  getRevenueData,
  getRevenueDataById,
  updateRevenueData,
  deleteRevenueData,
  bulkCreateRevenueData,
} from "../controllers/revenueController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All revenue routes require authentication
router.use(authMiddleware);

// Validation rules
const createRevenueValidation = [
  body("date").isISO8601().toDate().withMessage("Valid date is required"),
  body("posRevenue")
    .isNumeric()
    .custom((value) => value >= 0)
    .withMessage("POS Revenue must be a positive number"),
  body("eatclubRevenue")
    .isNumeric()
    .custom((value) => value >= 0)
    .withMessage("Eatclub Revenue must be a positive number"),
  body("labourCosts")
    .isNumeric()
    .custom((value) => value >= 0)
    .withMessage("Labour Costs must be a positive number"),
  body("totalCovers")
    .isInt({ min: 0 })
    .withMessage("Total Covers must be a positive integer"),
  body("events")
    .optional()
    .isArray()
    .withMessage("Events must be an array")
    .custom((events) => {
      if (events && events.length > 0) {
        for (const event of events) {
          if (!event.name || typeof event.name !== 'string') {
            throw new Error('Event name is required and must be a string');
          }
          if (!event.impact || !['positive', 'negative'].includes(event.impact)) {
            throw new Error('Event impact must be either "positive" or "negative"');
          }
        }
      }
      return true;
    }),
];

const updateRevenueValidation = [
  body("posRevenue")
    .optional()
    .isNumeric()
    .custom((value) => value >= 0)
    .withMessage("POS Revenue must be a positive number"),
  body("eatclubRevenue")
    .optional()
    .isNumeric()
    .custom((value) => value >= 0)
    .withMessage("Eatclub Revenue must be a positive number"),
  body("labourCosts")
    .optional()
    .isNumeric()
    .custom((value) => value >= 0)
    .withMessage("Labour Costs must be a positive number"),
  body("totalCovers")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Total Covers must be a positive integer"),
  body("events").optional().isArray().withMessage("Events must be an array"),
];

/**
 * @swagger
 * /api/admin/revenue:
 *   post:
 *     tags: [Revenue Management]
 *     summary: Create revenue data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RevenueData'
 *     responses:
 *       201:
 *         description: Revenue data created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RevenueData'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Data already exists for this date
 *   get:
 *     tags: [Revenue Management]
 *     summary: Get all revenue data with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: weekNumber
 *         schema:
 *           type: integer
 *         description: Filter by week number
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Revenue data list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RevenueData'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.post("/", createRevenueValidation, createRevenueData);
router.get("/", getRevenueData);

/**
 * @swagger
 * /api/admin/revenue/bulk:
 *   post:
 *     tags: [Revenue Management]
 *     summary: Bulk create revenue data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/RevenueData'
 *     responses:
 *       201:
 *         description: Bulk data created successfully
 *       400:
 *         description: Invalid data format
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Some data already exists
 */
router.post("/bulk", bulkCreateRevenueData);

/**
 * @swagger
 * /api/admin/revenue/{id}:
 *   get:
 *     tags: [Revenue Management]
 *     summary: Get revenue data by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Revenue data ID
 *     responses:
 *       200:
 *         description: Revenue data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/RevenueData'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Revenue data not found
 *   put:
 *     tags: [Revenue Management]
 *     summary: Update revenue data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Revenue data ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               posRevenue:
 *                 type: number
 *               eatclubRevenue:
 *                 type: number
 *               labourCosts:
 *                 type: number
 *               totalCovers:
 *                 type: integer
 *               events:
 *                 type: array
 *     responses:
 *       200:
 *         description: Revenue data updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Revenue data not found
 *   delete:
 *     tags: [Revenue Management]
 *     summary: Delete revenue data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Revenue data ID
 *     responses:
 *       200:
 *         description: Revenue data deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Revenue data not found
 */
router.get("/:id", getRevenueDataById);
router.put("/:id", updateRevenueValidation, updateRevenueData);
router.delete("/:id", deleteRevenueData);

export default router;
