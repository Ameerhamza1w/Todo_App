import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Todo {
    id: number;
    task: string;
    dueDate?: Date | null; // Allow both undefined and null
    alarmTime?: { hours: number; minutes: number }; // Store alarm time as an object
    audioSrc?: string; // Store the source of the audio
}

const TodoApp = () => {
    const [task, setTask] = useState<string>("");
    const [todos, setTodos] = useState<Todo[]>([]);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [alarmHours, setAlarmHours] = useState<number | string>(""); // Start empty
    const [alarmMinutes, setAlarmMinutes] = useState<number | string>(""); // Start empty
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
        if (task.trim() === "") return;

        // Convert alarm hours and minutes to numbers
        const alarmTime = {
            hours: Number(alarmHours),
            minutes: Number(alarmMinutes)
        };

        const newTask: Todo = {
            id: Date.now(),
            task,
            dueDate,
            alarmTime,
            audioSrc: audioFile ? URL.createObjectURL(audioFile) : undefined
        };
        setTodos([...todos, newTask]);
        setTask("");
        setDueDate(null);
        setAlarmHours(""); // Reset to empty
        setAlarmMinutes(""); // Reset to empty
        setAudioFile(null); // Reset audio file

        if (dueDate) {
            const alarmDate = new Date(dueDate);
            alarmDate.setHours(alarmTime.hours);
            alarmDate.setMinutes(alarmTime.minutes);

            const timeToReminder = alarmDate.getTime() - new Date().getTime();
            if (timeToReminder > 0) {
                setTimeout(() => {
                    showNotification(newTask.task, newTask.audioSrc);
                }, timeToReminder);
            }
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
                <DatePicker
                    selected={dueDate}
                    onChange={(date) => setDueDate(date)}
                    dateFormat="P" // Format changed to only show the date
                    placeholderText="Set due date"
                />
                <div>
                    <label htmlFor="alarm-hours">Set Time: </label>
                    <input
                        type="number"
                        id="alarm-hours"
                        value={alarmHours}
                        onChange={(e) => setAlarmHours(e.target.value)}
                        min="0"
                        max="23"
                        placeholder="HH"
                    />
                    <span>:</span>
                    <input
                        type="number"
                        id="alarm-minutes"
                        value={alarmMinutes}
                        onChange={(e) => setAlarmMinutes(e.target.value)}
                        min="0"
                        max="59"
                        placeholder="MM"
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
                    disabled={!task || (!alarmHours && !alarmMinutes)} // Ensure time is set
                    className={task ? "active" : ""}
                >
                    Add Task
                </button>
            </div>

            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        {todo.task} 
                        {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : ""} {/* Display only the date */}
                        <button onClick={() => deleteTask(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoApp;
