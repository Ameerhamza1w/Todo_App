import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Todo {
    id: number;
    task: string;
    dueDate?: Date | null; // Allow both undefined and null
    alarmTime?: { hours: number; minutes: number }; // Store alarm time as an object
}

const TodoApp = () => {
    const [task, setTask] = useState<string>("");
    const [todos, setTodos] = useState<Todo[]>([]);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [alarmHours, setAlarmHours] = useState<number>(0);
    const [alarmMinutes, setAlarmMinutes] = useState<number>(0);
    const alarmSound = new Audio("/alarm.mp3"); // Load your alarm sound file

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
        
        const alarmTime = { hours: alarmHours, minutes: alarmMinutes };

        const newTask: Todo = { id: Date.now(), task, dueDate, alarmTime };
        setTodos([...todos, newTask]);
        setTask("");
        setDueDate(null);
        setAlarmHours(0);
        setAlarmMinutes(0); // Reset alarm time after adding a task

        if (dueDate) {
            const alarmDate = new Date(dueDate);
            alarmDate.setHours(alarmHours);
            alarmDate.setMinutes(alarmMinutes);

            const timeToReminder = alarmDate.getTime() - new Date().getTime();
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

            // Play the alarm sound
            alarmSound.play().catch(error => {
                console.error("Error playing sound:", error);
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
                    dateFormat="Pp"
                    placeholderText="Set due date" 
                    showTimeSelect={false} // Disable time selection
                />
                <div>
                    <label htmlFor="alarm-hours">Set Time: </label>
                    <input
                        type="number"
                        id="alarm-hours"
                        value={alarmHours}
                        onChange={(e) => setAlarmHours(Number(e.target.value))}
                        min="0"
                        max="23"
                        placeholder="HH"
                    />
                    <span>:</span>
                    <input
                        type="number"
                        id="alarm-minutes"
                        value={alarmMinutes}
                        onChange={(e) => setAlarmMinutes(Number(e.target.value))}
                        min="0"
                        max="59"
                        placeholder="MM"
                    />
                </div>
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
                        {todo.alarmTime ? ` (Alarm at ${todo.alarmTime.hours}:${todo.alarmTime.minutes < 10 ? '0' : ''}${todo.alarmTime.minutes})` : ""}
                        <button onClick={() => deleteTask(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoApp;
