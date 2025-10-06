import React, { useEffect, useState } from 'react';
import './App.css'; // We'll add some CSS here
import './index.css'; // For basic global styles (from initial setup)

// Define the Task interface
interface Task {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at?: string;
}

const API_BASE_URL = '/api'; // This will be proxied by Nginx in Docker, or localhost:5000 directly

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true); // For initial task fetching
  const [error, setError] = useState<string | null>(null); // For general API errors
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // For form submission status

  const fetchTasks = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(`Failed to fetch tasks: ${err.message}`);
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []); // Fetch tasks on component mount

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert('Task title cannot be empty.'); // Basic client-side validation
      return;
    }

    setIsSubmitting(true); // Start submitting
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Try to read backend error message
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setNewTaskTitle('');      // Clear inputs
      setNewTaskDescription(''); // Clear inputs
      fetchTasks();             // Refresh the task list
    } catch (err: any) {
      setError(`Failed to add task: ${err.message}`);
      console.error('Failed to add task:', err);
    } finally {
      setIsSubmitting(false); // End submitting
    }
  };

  const handleMarkDone = async (id: number) => {
    // You could add a specific loading state for the 'Done' button if desired,
    // but for simplicity, we'll rely on the main task list loading after the update.
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorData = await response.json(); // Try to read backend error message
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      fetchTasks(); // Refresh the task list
    } catch (err: any) {
      setError(`Failed to mark task done: ${err.message}`);
      console.error('Failed to mark task done:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo Application</h1>
      </header>

      <main className="App-main">
        <section className="task-form-section">
          <h2>Add New Task</h2>
          <form onSubmit={handleAddTask} className="task-form">
            <input
              type="text"
              placeholder="Task Title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
              disabled={isSubmitting} // Disable while submitting
            />
            <textarea
              placeholder="Task Description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              rows={3}
              disabled={isSubmitting} // Disable while submitting
            ></textarea>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Task'} {/* Dynamic button text */}
            </button>
          </form>
        </section>

        <section className="task-list-section">
          <h2>Recent Incomplete Tasks</h2>
          {error && <p className="error-message">{error}</p>} {/* Display general errors */}

          {loading ? ( // Display spinner if tasks are being fetched
            <div className="spinner-container">
                <div className="spinner"></div>
                <p>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <p>No incomplete tasks found. Add a new one!</p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <button onClick={() => handleMarkDone(task.id)}>Done</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;