import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css'; // Assuming your CSS is in App.css

interface Todo {
  task: string;
  dueDate: Date;
}

const TodoApp: React.FC = () => {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);

  const handleAddTask = () => {
    if (task && dueDate) {
      setTodos([...todos, { task, dueDate }]);
      setTask('');
      setDueDate(null);
    }
  };

  const handleDeleteTask = (index: number) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  return (
    <div className="App">
      <div className="todo-container">
        <div className="input-section">
          <input
            type="text"
            placeholder="Add a task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a date"
            className="react-datepicker__input-container"
          />
          <button
            onClick={handleAddTask}
            disabled={!task || !dueDate}
            className={!task || !dueDate ? 'disabled' : 'active'}
          >
            Add Task
          </button>
        </div>

        <ul>
          {todos.map((todo, index) => (
            <li key={index}>
              <span>{todo.task} - {todo.dueDate.toLocaleString()}</span>
              <button onClick={() => handleDeleteTask(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TodoApp;
