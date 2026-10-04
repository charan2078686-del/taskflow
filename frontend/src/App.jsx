import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    CheckCircle2,
    Circle,
    Clock3,
    LayoutDashboard,
    ListTodo,
    LogOut,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";
import "./App.css";

const API = "https://taskflow-backend-111g.onrender.com/api";

function App() {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("taskflow_user") || "null")
    );
    const [token, setToken] = useState(
        localStorage.getItem("taskflow_token")
    );

    const [tasks, setTasks] = useState([]);
    const [showLogin, setShowLogin] = useState(!token);
    const [authMode, setAuthMode] = useState("login");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authMessage, setAuthMessage] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);

    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        due_date: ""
    });

    const fetchTasks = async () => {
        if (!token) return;

        try {
            const response = await axios.get(`${API}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setTasks(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                logout();
            }
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [token]);

    const login = async (e) => {
        e.preventDefault();
        setAuthMessage("");

        try {
            const response = await axios.post(`${API}/auth/login`, {
                email,
                password
            });

            localStorage.setItem("taskflow_token", response.data.token);
            localStorage.setItem(
                "taskflow_user",
                JSON.stringify(response.data.user)
            );

            setToken(response.data.token);
            setUser(response.data.user);
            setShowLogin(false);
        } catch (error) {
            setAuthMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    const register = async (e) => {
        e.preventDefault();
        setAuthMessage("");

        try {
            await axios.post(`${API}/auth/register`, {
                name,
                email,
                password
            });

            setAuthMessage("Account created. Please login.");
            setAuthMode("login");
            setName("");
            setPassword("");
        } catch (error) {
            setAuthMessage(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    const logout = () => {
        localStorage.removeItem("taskflow_token");
        localStorage.removeItem("taskflow_user");
        setToken(null);
        setUser(null);
        setTasks([]);
        setShowLogin(true);
    };

    const createTask = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                `${API}/tasks`,
                newTask,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setNewTask({
                title: "",
                description: "",
                priority: "medium",
                status: "todo",
                due_date: ""
            });

            setShowModal(false);
            fetchTasks();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to create task"
            );
        }
    };

    const updateTask = async (task, changes) => {
        try {
            await axios.put(
                `${API}/tasks/${task.id}`,
                {
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    status: changes.status || task.status,
                    category_id: task.category_id,
                    due_date: task.due_date
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            fetchTasks();
        } catch (error) {
            alert("Failed to update task");
        }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`${API}/tasks/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            fetchTasks();
        } catch (error) {
            alert("Failed to delete task");
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesFilter =
                filter === "all" ||
                task.status === filter ||
                task.priority === filter;

            return matchesSearch && matchesFilter;
        });
    }, [tasks, search, filter]);

    const total = tasks.length;
    const completed = tasks.filter(
        (task) => task.status === "completed"
    ).length;
    const progress = tasks.filter(
        (task) => task.status === "in_progress"
    ).length;
    const todo = tasks.filter(
        (task) => task.status === "todo"
    ).length;

    if (showLogin) {
        return (
            <div className="auth-page">
                <div className="auth-box">
                    <div className="brand-icon">
                        <CheckCircle2 size={36} />
                    </div>

                    <h1>TaskFlow</h1>
                    <p>Smart Task & Productivity Management</p>

                    <div className="auth-tabs">
                        <button
                            className={
                                authMode === "login"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => {
                                setAuthMode("login");
                                setAuthMessage("");
                            }}
                        >
                            Login
                        </button>

                        <button
                            className={
                                authMode === "register"
                                    ? "active"
                                    : ""
                            }
                            onClick={() => {
                                setAuthMode("register");
                                setAuthMessage("");
                            }}
                        >
                            Register
                        </button>
                    </div>

                    <form
                        onSubmit={
                            authMode === "login"
                                ? login
                                : register
                        }
                    >
                        {authMode === "register" && (
                            <input
                                placeholder="Full name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                required
                            />
                        )}

                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                        <button className="primary-button">
                            {authMode === "login"
                                ? "Login to TaskFlow"
                                : "Create Account"}
                        </button>
                    </form>

                    {authMessage && (
                        <div className="auth-message">
                            {authMessage}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <CheckCircle2 size={30} />
                    <span>TaskFlow</span>
                </div>

                <nav>
                    <button className="nav-item active">
                        <LayoutDashboard size={19} />
                        Dashboard
                    </button>

                    <button className="nav-item">
                        <ListTodo size={19} />
                        My Tasks
                    </button>

                    <button className="nav-item">
                        <Clock3 size={19} />
                        Productivity
                    </button>
                </nav>

                <button
                    className="logout-button"
                    onClick={logout}
                >
                    <LogOut size={19} />
                    Logout
                </button>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <h2>Good day, {user?.name} 👋</h2>
                        <p>Let's make today productive.</p>
                    </div>

                    <button
                        className="add-button"
                        onClick={() => setShowModal(true)}
                    >
                        <Plus size={19} />
                        Add Task
                    </button>
                </header>

                <section className="stats">
                    <div className="stat-card">
                        <span>Total Tasks</span>
                        <strong>{total}</strong>
                    </div>

                    <div className="stat-card">
                        <span>To Do</span>
                        <strong>{todo}</strong>
                    </div>

                    <div className="stat-card">
                        <span>In Progress</span>
                        <strong>{progress}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Completed</span>
                        <strong>{completed}</strong>
                    </div>
                </section>

                <section className="task-section">
                    <div className="section-header">
                        <div>
                            <h3>My Tasks</h3>
                            <p>Manage your work and stay organized.</p>
                        </div>

                        <div className="controls">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    placeholder="Search tasks..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />
                            </div>

                            <select
                                value={filter}
                                onChange={(e) =>
                                    setFilter(e.target.value)
                                }
                            >
                                <option value="all">All</option>
                                <option value="todo">To Do</option>
                                <option value="in_progress">
                                    In Progress
                                </option>
                                <option value="completed">
                                    Completed
                                </option>
                                <option value="critical">
                                    Critical
                                </option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="task-list">
                        {filteredTasks.length === 0 ? (
                            <div className="empty-state">
                                <ListTodo size={45} />
                                <h3>No tasks found</h3>
                                <p>
                                    Create a task to start organizing
                                    your work.
                                </p>
                            </div>
                        ) : (
                            filteredTasks.map((task) => (
                                <div
                                    className="task-card"
                                    key={task.id}
                                >
                                    <button
                                        className="complete-button"
                                        onClick={() =>
                                            updateTask(task, {
                                                status:
                                                    task.status ===
                                                    "completed"
                                                        ? "todo"
                                                        : "completed"
                                            })
                                        }
                                    >
                                        {task.status ===
                                        "completed" ? (
                                            <CheckCircle2 />
                                        ) : (
                                            <Circle />
                                        )}
                                    </button>

                                    <div className="task-info">
                                        <h4
                                            className={
                                                task.status ===
                                                "completed"
                                                    ? "completed-task"
                                                    : ""
                                            }
                                        >
                                            {task.title}
                                        </h4>

                                        <p>
                                            {task.description ||
                                                "No description"}
                                        </p>

                                        <div className="task-meta">
                                            <span
                                                className={`priority ${task.priority}`}
                                            >
                                                {task.priority}
                                            </span>

                                            <span>
                                                {task.status.replace(
                                                    "_",
                                                    " "
                                                )}
                                            </span>

                                            {task.due_date && (
                                                <span>
                                                    Due:{" "}
                                                    {new Date(
                                                        task.due_date
                                                    ).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            deleteTask(task.id)
                                        }
                                    >
                                        <Trash2 size={19} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <h3>Create New Task</h3>
                                <p>Add something important to your list.</p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={createTask}>
                            <label>Task title</label>
                            <input
                                placeholder="Enter task title"
                                value={newTask.title}
                                onChange={(e) =>
                                    setNewTask({
                                        ...newTask,
                                        title: e.target.value
                                    })
                                }
                                required
                            />

                            <label>Description</label>
                            <textarea
                                placeholder="What needs to be done?"
                                value={newTask.description}
                                onChange={(e) =>
                                    setNewTask({
                                        ...newTask,
                                        description:
                                            e.target.value
                                    })
                                }
                            />

                            <div className="form-row">
                                <div>
                                    <label>Priority</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                priority:
                                                    e.target.value
                                            })
                                        }
                                    >
                                        <option value="low">
                                            Low
                                        </option>
                                        <option value="medium">
                                            Medium
                                        </option>
                                        <option value="high">
                                            High
                                        </option>
                                        <option value="critical">
                                            Critical
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label>Status</label>
                                    <select
                                        value={newTask.status}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                status:
                                                    e.target.value
                                            })
                                        }
                                    >
                                        <option value="todo">
                                            To Do
                                        </option>
                                        <option value="in_progress">
                                            In Progress
                                        </option>
                                        <option value="completed">
                                            Completed
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <label>Due date</label>
                            <input
                                type="date"
                                value={newTask.due_date}
                                onChange={(e) =>
                                    setNewTask({
                                        ...newTask,
                                        due_date: e.target.value
                                    })
                                }
                            />

                            <button className="primary-button">
                                Create Task
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
