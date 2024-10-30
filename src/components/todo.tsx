import { useState, useEffect } from "react";

interface Todo {
  id: number;
  task: string;
}

// Load initial todos from localStorage, if available
const getInitialTodos = (): Todo[] => {
  const savedTodos = localStorage.getItem("todos");
  console.log("Loaded todos from localStorage:", savedTodos); // Debugging line
  return savedTodos ? JSON.parse(savedTodos) : [];
};

const TodoApp = () => {
  const [task, setTask] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>(getInitialTodos);

  // Update localStorage whenever todos array changes
  useEffect(() => {
    console.log("Updating localStorage with todos:", todos); // Debugging line
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTask = () => {
    if (task.trim() === "") return;
    const newTask = { id: Date.now(), task };
    setTodos([...todos, newTask]);
    setTask("");
  };

  const deleteTask = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-container">
      <div className="input-section">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter a task"
        />
        <button
          onClick={addTask}
          disabled={!task}
          className={task ? "active" : ""}
        >
          Add Task
        </button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.task}
            <button onClick={() => deleteTask(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;
