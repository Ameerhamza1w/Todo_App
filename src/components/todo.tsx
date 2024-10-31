import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Todo {
    id: number;
    task: string;
    dueDate?: Date | null; // Allow both undefined and null
}

const TodoApp = () => {
    const [task, setTask] = useState<string>("");
    const [todos, setTodos] = useState<Todo[]>([]);
    const [dueDate, setDueDate] = useState<Date | null>(null);

    useEffect(() => {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
            setTodos(JSON.parse(savedTodos));
        }

        if ("Notification" in window) {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    const addTask = () => {
        if (task.trim() === "") return;
        const newTask: Todo = { id: Date.now(), task, dueDate };
        setTodos([...todos, newTask]);
        setTask("");
        setDueDate(null);

        if (dueDate) {
            const timeToReminder = new Date(dueDate).getTime() - new Date().getTime();
            if (timeToReminder > 0) {
                setTimeout(() => {
                    showNotification(newTask.task);
                }, timeToReminder);
            }
        }
    };

    const deleteTask = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const showNotification = (task: string) => {
        if (Notification.permission === "granted") {
            new Notification("Task Reminder", {
                body: `Reminder for task: ${task}`,
                icon: "/path-to-icon/icon.png", 
            });
        }
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
                <DatePicker
                    selected={dueDate}
                    onChange={(date) => setDueDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="Set due date and time"
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
                        {todo.task} - {todo.dueDate ? new Date(todo.dueDate).toLocaleString() : ""}
                        <button onClick={() => deleteTask(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoApp;
