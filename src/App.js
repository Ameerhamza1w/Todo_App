import TodoApp from "./components/Todo";
import "./App.css";
export default function App() {
    return (React.createElement("div", { className: "App" },
        React.createElement("h1", null, " Todo List"),
        React.createElement(TodoApp, null)));
}
