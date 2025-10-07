"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const promise_1 = __importDefault(require("mysql2/promise"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
let pool;
async function connectToDatabase() {
    exports.pool = pool = promise_1.default.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'user',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'tododb',
        port: parseInt(process.env.DB_PORT || '3306'),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
    // create table if not exists
    
    console.log('DB connected and table ensured.');
}
app.get('/', (req, res) => {
    res.send('Todo App Backend API is running!');
});
// GET route to fetch tasks (already there)
app.get('/api/tasks', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, title, description, is_completed FROM tasks WHERE is_completed = FALSE ORDER BY created_at DESC LIMIT 5');
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});
// !!! THIS IS THE ROUTE THAT'S CAUSING THE 404 !!!
// POST route to add a new task (UNCOMMENT THIS BLOCK AND REMOVE THE TEST BLOCK)
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;

  // Basic validation
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description) VALUES (?, ?)',
      [title, description || null] // Use null if description is not provided
    );
    // Assert result type for TypeScript if needed, or cast
    const insertResult = result;
    res.status(201).json({ id: insertResult.insertId, title, description, is_completed: false });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Error adding task' });
  }
});
// PUT route to mark a task as complete (also ensure this is present for later)
app.put('/api/tasks/:id/complete', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.execute('UPDATE tasks SET is_completed = TRUE WHERE id = ?', [id]);
        const updateResult = result;
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task marked as complete' });
    }
    catch (error) {
        console.error('Error marking task complete:', error);
        res.status(500).json({ message: 'Error marking task complete' });
    }
});
// ✅ Start server after DB connection
connectToDatabase().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
