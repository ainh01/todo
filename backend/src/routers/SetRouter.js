const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const writeQueue = require('../middleware/writeQueue');
const { getSets, createOrSwitchSet, deleteSet } = require('../controllers/SetController');

/**
 * @swagger
 * /api/sets:
 *   get:
 *     summary: Get all sets for authenticated user
 *     tags: [Sets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of { key, taskCount }
 */
router.get('/sets', protect, getSets);

/**
 * @swagger
 * /api/sets:
 *   post:
 *     summary: Create a new set or switch to existing
 *     tags: [Sets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key]
 *             properties:
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns updated currentKey
 */
router.post('/sets', protect, writeQueue, createOrSwitchSet);

/**
 * @swagger
 * /api/sets:
 *   delete:
 *     summary: Delete a set and its tasks
 *     tags: [Sets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key]
 *             properties:
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns new currentKey after deletion
 */
router.delete('/sets', protect, writeQueue, deleteSet);

module.exports = router;
