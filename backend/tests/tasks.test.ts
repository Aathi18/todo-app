import request from 'supertest';
import { app, pool } from '../src/app'; // Import your Express app and database pool
import { ResultSetHeader } from 'mysql2/promise'; // For type checking

// Mock environment variables for testing (if needed)
process.env.DB_HOST = 'localhost'; // Or a separate test database
process.env.DB_USER = 'user';
process.env.DB_PASSWORD = 'password';
process.env.DB_NAME = 'tododb';
process.env.DB_PORT = '3306';

// Before all tests, ensure the DB connection and clean up if necessary
beforeAll(async () => {
  // Ensure the test database is clean before running tests
  await pool.execute('DELETE FROM tasks');
});

// After each test, you might want to clean up specific data
afterEach(async () => {
  await pool.execute('DELETE FROM tasks');
});

// After all tests, close the database connection
afterAll(async () => {
  await pool.end(); // Close the pool
});

describe('Task API', () => {

  it('should get all tasks (empty initially)', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it('should add a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test Task 1',
        description: 'This is a description for test task 1.'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toEqual('Test Task 1');
    expect(res.body.description).toEqual('This is a description for test task 1.');
    expect(res.body.is_completed).toEqual(false);

    // Verify it's in the database
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [res.body.id]);
    expect((rows as any[]).length).toEqual(1);
    expect((rows as any[])[0].title).toEqual('Test Task 1');
  });

  it('should get 5 most recent incomplete tasks', async () => {
    // Add more than 5 tasks to ensure only 5 are returned
    for (let i = 0; i < 7; i++) {
      await pool.execute('INSERT INTO tasks (title) VALUES (?)', [`Task ${i}`]);
    }
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(5);
    expect(res.body[0].title).toEqual('Task 6'); // Most recent first
  });

  it('should mark a task as complete', async () => {
    const [insertResult] = await pool.execute(
      'INSERT INTO tasks (title) VALUES (?)', ['Task to complete']
    ) as [ResultSetHeader, any]; // Explicitly cast for direct DB interaction

    const taskId = insertResult.insertId;

    const res = await request(app).put(`/api/tasks/${taskId}/complete`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Task marked as complete');

    // Verify in database
    const [rows] = await pool.execute('SELECT is_completed FROM tasks WHERE id = ?', [taskId]);
    expect((rows as any[])[0].is_completed).toEqual(1); // MySQL boolean is 1 or 0

    // Ensure it's not in the incomplete list anymore
    const getRes = await request(app).get('/api/tasks');
    expect(getRes.body.some((task: any) => task.id === taskId)).toBeFalsy();
  });

  it('should return 404 if task to complete is not found', async () => {
    const res = await request(app).put('/api/tasks/9999/complete'); // Non-existent ID
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Task not found');
  });

  it('should require a title when adding a task', async () => {
    const res = await request(app).post('/api/tasks').send({ description: 'No title here' });
    expect(res.statusCode).toEqual(400); // Or 500 if no basic validation
    expect(res.body.message).toEqual('Title is required');
  });
});