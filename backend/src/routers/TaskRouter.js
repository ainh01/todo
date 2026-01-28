const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  moveTask,
  finishTask,
  deleteTask
} = require('../controllers/TaskController');

/**  
 * @swagger  
 * components:  
 *   schemas:  
 *     Task:  
 *       type: object  
 *       required:  
 *         - title  
 *       properties:  
 *         task_id:  
 *           type: integer  
 *         title:  
 *           type: string  
 *         slot:  
 *           type: integer  
 *         finished:  
 *           type: boolean  
 *         created_at:  
 *           type: string  
 *           format: date-time  
 *         updated_at:  
 *           type: string  
 *           format: date-time  
 */

/**  
 * @swagger  
 * /api/tasks:  
 *   post:  
 *     summary: Create a new task  
 *     tags: [Tasks]  
 *     security:  
 *       - bearerAuth: []  
 *     requestBody:  
 *       required: true  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             required:  
 *               - title  
 *             properties:  
 *               title:  
 *                 type: string  
 *     responses:  
 *       201:  
 *         description: Task created successfully  
 *       401:  
 *         description: Unauthorized  
 */
router.post('/tasks', protect, createTask);

/**  
 * @swagger  
 * /api/tasks:  
 *   get:  
 *     summary: Get all tasks sorted by slot  
 *     tags: [Tasks]  
 *     security:  
 *       - bearerAuth: []  
 *     responses:  
 *       200:  
 *         description: List of tasks sorted by slot  
 *       401:  
 *         description: Unauthorized  
 */
router.get('/tasks', protect, getTasks);

/**  
 * @swagger  
 * /api/tasks/{id}:  
 *   get:  
 *     summary: Get task by ID  
 *     tags: [Tasks]  
 *     security:  
 *       - bearerAuth: []  
 *     parameters:  
 *       - in: path  
 *         name: id  
 *         required: true  
 *         schema:  
 *           type: integer  
 *     responses:  
 *       200:  
 *         description: Task details  
 *       404:  
 *         description: Task not found  
 */
router.get('/tasks/:id', protect, getTask);

/**  
 * @swagger  
 * /api/tasks/{id}:  
 *   put:  
 *     summary: Update task title  
 *     tags: [Tasks]  
 *     security:  
 *       - bearerAuth: []  
 *     parameters:  
 *       - in: path  
 *         name: id  
 *         required: true  
 *         schema:  
 *           type: integer  
 *     requestBody:  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             properties:  
 *               title:  
 *                 type: string  
 *     responses:  
 *       200:  
 *         description: Task updated successfully  
 *       404:  
 *         description: Task not found  
 */
router.put('/tasks/:id', protect, updateTask);

/**  
 * @swagger  
 * /api/tasks/{id}/move:  
 *   put:  
 *     summary: Move task to different slot position  
 *     tags: [Tasks]  
 *     security:  
 *       - bearerAuth: []  
 *     parameters:  
 *       - in: path  
 *         name: id  
 *         required: true  
 *         schema:  
 *           type: integer  
 *     requestBody:  
 *       required: true  
 *       content:  
 *         application/json:  
 *           schema:  
 *             type: object  
 *             required:  
 *               - target_slot  
 *             properties:  
 *               target_slot:  
 *                 type: integer  
 *                 minimum: 1  
 *     responses:  
 *       200:  
 *         description: Task moved successfully  
 *       400:  
 *         description: Invalid target_slot  
 *       404:  
 *         description: Task not found  
 */
router.put('/tasks/:id/move', protect, moveTask);

/**  
 * @swagger  
 * /api/tasks/{id}/finish:  
 *   post:  
 *     summary: Toggle task finished status  
 *     tags: [Tasks]  
 *     security:  
 *       - bearerAuth: []  
 *     parameters:  
 *       - in: path  
 *         name: id  
 *         required: true  
 *         schema:  
 *           type: integer  
 *     responses:  
 *       200:  
 *         description: Task status toggled successfully  
 *       404:  
 *         description: Task not found  
 */
router.post('/tasks/:id/finish', protect, finishTask);

/**  
 * @swagger  
 * /api/tasks/{id}:  
 *   delete:  
 *     summary: Delete task and reorder slots  
 *     tags: [Tasks]  
 *     security:  
 *       - bearerAuth: []  
 *     parameters:  
 *       - in: path  
 *         name: id  
 *         required: true  
 *         schema:  
 *           type: integer  
 *     responses:  
 *       200:  
 *         description: Task deleted successfully  
 *       404:  
 *         description: Task not found  
 */
router.delete('/tasks/:id', protect, deleteTask);

module.exports = router;  