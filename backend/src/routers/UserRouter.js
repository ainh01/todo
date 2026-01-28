const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         task_id:
 *           type: number
 *         title:
 *           type: string
 *         description:
 *           type: string
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - pass
 *       properties:
 *         id:
 *           type: string
 *           description: MongoDB ObjectId
 *         email:
 *           type: string
 *           format: email
 *         pass:
 *           type: string
 *           format: password
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUser:
 *       type: object
 *       required:
 *         - email
 *         - pass
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         pass:
 *           type: string
 *           format: password
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: User created with JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 */
router.post('/users/register', UserController.createUser);


/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               pass:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with JWT token
 */
router.post('/users/login', UserController.loginUser);

// /**
//  * @swagger
//  * /api/users:
//  *   get:
//  *     summary: Get all users (protected)
//  *     tags: [Users]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of users
//  */
// router.get('/users', protect, UserController.getAllUsers);

// /**
//  * @swagger
//  * /api/users/{id}:
//  *   get:
//  *     summary: Get user by ID (protected)
//  *     tags: [Users]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: User details
//  */
// router.get('/users/:id', protect, UserController.getUserById);

// /**
//  * @swagger
//  * /api/users/{id}:
//  *   put:
//  *     summary: Update user (protected)
//  *     tags: [Users]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/User'
//  *     responses:
//  *       200:
//  *         description: User updated
//  */
// router.put('/users/:id', protect, UserController.updateUser);

// /**
//  * @swagger
//  * /api/users/{id}:
//  *   delete:
//  *     summary: Delete user (protected)
//  *     tags: [Users]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: User deleted
//  */
// router.delete('/users/:id', protect, UserController.deleteUser);

module.exports = router;