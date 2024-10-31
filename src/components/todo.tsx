import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Todo {
    id: number;
    task: string;
    dueDate: Date | null; // Ensure dueDate is correctly typed
    audioSrc?: string;
}

const TodoApp = () => {
    const [task, setTask] = useState<string>("");
    const [todos, setTodos] = useState<Todo[]>([]);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

    useEffect(() => {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
            setTodos(JSON.parse(savedTodos));
        }

        if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
                if (permission !== "granted") {
                    console.error("Notification permission denied");
                }
            });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    const addOrUpdateTask = () => {
        if (!task.trim() || !dueDate) return; // Ensure task and due date are set

        const newTask: Todo = {
            id: editingTaskId !== null ? editingTaskId : Date.now(),
            task,
            dueDate, // This will either be a Date or null
            audioSrc: audioFile ? URL.createObjectURL(audioFile) : undefined,
        };

        if (editingTaskId !== null) {
            // Update existing task
            setTodos(todos.map(todo => (todo.id === editingTaskId ? newTask : todo)));
            setEditingTaskId(null); // Reset editing state
        } else {
            // Add new task
            setTodos([...todos, newTask]);
        }

        setTask(""); // Reset input field
        setDueDate(null); // Reset due date
        setAudioFile(null); // Reset audio file

        const alarmDate = new Date(dueDate);
        const timeToReminder = alarmDate.getTime() - Date.now();
        if (timeToReminder > 0) {
            setTimeout(() => {
                showNotification(newTask.task, newTask.audioSrc);
            }, timeToReminder);
        } else {
            alert("Please select a future date and time for the reminder.");
        }
    };

    const showNotification = (task: string, audioSrc?: string) => {
        if (Notification.permission === "granted") {
            const notification = new Notification("Task Reminder", {
                body: `Reminder for task: ${task}`,
                icon: "/path-to-icon/icon.png",
            });

            notification.onclick = () => {
                console.log("Notification clicked!");
            };

            playAlarmSound(audioSrc);
        } else {
            alert("Notification permission not granted. Playing sound only.");
            playAlarmSound(audioSrc);
        }
    };

    const playAlarmSound = (audioSrc?: string) => {
        if (audioSrc) {
            const alarmSound = new Audio(audioSrc);
            alarmSound.play().catch((error) => {
                console.error("Error playing sound:", error);
            });
        }
    };

    const deleteTask = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const editTask = (todo: Todo) => {
        setTask(todo.task);
        setDueDate(todo.dueDate); // This can be null
        setEditingTaskId(todo.id);
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
                    onChange={(date) => setDueDate(date)} // This can be Date or null
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="Set due date and time"
                />
                <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            setAudioFile(e.target.files[0]);
                        }
                    }}
                />
                <button 
                    onClick={addOrUpdateTask} 
                    style={{
                        backgroundColor: task.trim() ? "#4CAF50" : "#ccc", // Change color based on task input
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: task.trim() ? "pointer" : "not-allowed", // Change cursor based on task input
                        opacity: task.trim() ? 1 : 0.6 // Adjust opacity for visual feedback
                    }}
                    disabled={!task.trim()} // Keep the button enabled but style it accordingly
                >
                    Add Task
                </button>
            </div>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        {todo.task} - {todo.dueDate?.toLocaleString() || "No due date set"}
                        <button onClick={() => editTask(todo)}>Edit</button>
                        <button onClick={() => deleteTask(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoApp;
