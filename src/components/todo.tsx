import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Todo {
    id: number;
    task: string;
    dueDate?: Date | null; // Allow both undefined and null
    audioSrc?: string; // Store the source of the audio
}

const TodoApp = () => {
    const [task, setTask] = useState<string>("");
    const [todos, setTodos] = useState<Todo[]>([]);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null); // For selected audio file

    useEffect(() => {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
            setTodos(JSON.parse(savedTodos));
        }

        // Request notification permission
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission !== "granted") {
                    console.log("Notification permission denied");
                }
            });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    const addTask = () => {
        if (task.trim() === "" || !dueDate) return; // Ensure a task and date are set

        const newTask: Todo = {
            id: Date.now(),
            task,
            dueDate,
            audioSrc: audioFile ? URL.createObjectURL(audioFile) : undefined
        };
        setTodos([...todos, newTask]);
        setTask("");
        setDueDate(null);
        setAudioFile(null); // Reset audio file

        // Set notification for the due date and time
        const alarmDate = new Date(dueDate);
        const timeToReminder = alarmDate.getTime() - new Date().getTime();
        if (timeToReminder > 0) {
            setTimeout(() => {
                showNotification(newTask.task, newTask.audioSrc);
            }, timeToReminder);
        }
    };

    const deleteTask = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const showNotification = (task: string, audioSrc?: string) => {
        if (Notification.permission === "granted") {
            new Notification("Task Reminder", {
                body: `Reminder for task: ${task}`,
                icon: "/path-to-icon/icon.png",
            });

            // Play the alarm sound if an audio source is provided
            if (audioSrc) {
                const alarmSound = new Audio(audioSrc);
                alarmSound.play().catch(error => {
                    console.error("Error playing sound:", error);
                });
            }
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
                <div>
                    <label htmlFor="date-time">Set Due Date and Time: </label>
                    <DatePicker
                        selected={dueDate}
                        onChange={(date) => setDueDate(date)}
                        showTimeSelect
                        dateFormat="Pp" // Show both date and time
                        placeholderText="Set due date and time"
                    />
                </div>
                <div>
                    <label htmlFor="audio-upload">Select Alarm Sound: </label>
                    <input
                        type="file"
                        id="audio-upload"
                        accept="audio/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setAudioFile(e.target.files[0]); // Set the selected audio file
                            }
                        }}
                    />
                </div>
                <button
                    onClick={addTask}
                    disabled={!task || !dueDate} // Ensure a task and date are set
                    className={task ? "active" : ""}
                >
                    Add Task
                </button>
            </div>

            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        {todo.task} 
                        {todo.dueDate ? new Date(todo.dueDate).toLocaleString() : ""} {/* Display date and time */}
                        <button onClick={() => deleteTask(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoApp;
