import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

let pool: mysql.Pool;

async function connectToDatabase() {
  pool = mysql.createPool({
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
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      is_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('DB connected and table ensured.');
}

app.get('/', (req, res) => {
  res.send('Todo App Backend API is running!');
});

// ✅ GET route to fetch 5 most recent incomplete tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, description, is_completed FROM tasks WHERE is_completed = FALSE ORDER BY id DESC LIMIT 5'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// ✅ POST route to add a new task
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;

  // Basic validation
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO tasks (title, description) VALUES (?, ?)',
      [title, description || null]
    );
    const insertResult = result as mysql.ResultSetHeader;

    res.status(201).json({
      id: insertResult.insertId,
      title,
      description: description || null,
      is_completed: false,
    });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Error adding task' });
  }
});

// ✅ PUT route to mark a task as complete
app.put('/api/tasks/:id/complete', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      'UPDATE tasks SET is_completed = TRUE WHERE id = ?',
      [id]
    );
    const updateResult = result as mysql.ResultSetHeader;

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task marked as complete' });
  } catch (error) {
    console.error('Error marking task complete:', error);
    res.status(500).json({ message: 'Error marking task complete' });
  }
});

// ✅ Start server after DB connection
connectToDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

export { app, pool };
