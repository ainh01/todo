const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin, checkAdminStatus } = require('../middleware/admin');
const writeQueue = require('../middleware/writeQueue');
const { getUserTasks, createUserTask } = require('../controllers/AdminController');

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminCheckResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         isAdmin:
 *           type: boolean
 */

/**
 * @swagger
 * /api/admin/check-status:
 *   get:
 *     summary: Check if current authenticated user is an admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin status check result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminCheckResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 */
router.get('/admin/check-status', protect, checkAdminStatus);

/**
 * @swagger
 * /api/admin/tasks/{email}:
 *   get:
 *     summary: Get all tasks for a specific user by email (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email to retrieve tasks for
 *     responses:
 *       200:
 *         description: User tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Task'
 *       400:
 *         description: Email parameter missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.get('/admin/tasks/:email', protect, isAdmin, getUserTasks);

/**
 * @swagger
 * /api/admin/tasks/{email}:
 *   post:
 *     summary: Create a task for a specific user by email (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email to create task for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - key
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               key:
 *                 type: string
 *                 description: Target set key (must already exist)
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Missing email parameter or title
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.post('/admin/tasks/:email', protect, isAdmin, writeQueue, createUserTask);

module.exports = router;
