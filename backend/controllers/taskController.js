const pool = require("../config/database");

const getTasks = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT tasks.*, categories.name AS category_name
             FROM tasks
             LEFT JOIN categories
             ON tasks.category_id = categories.id
             WHERE tasks.user_id = $1
             ORDER BY tasks.created_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
};

const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            status,
            category_id,
            due_date
        } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const result = await pool.query(
            `INSERT INTO tasks
            (user_id, category_id, title, description, priority, status, due_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                req.user.id,
                category_id || null,
                title,
                description || "",
                priority || "medium",
                status || "todo",
                due_date || null
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create task"
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            priority,
            status,
            category_id,
            due_date
        } = req.body;

        const completedAt =
            status === "completed"
                ? new Date()
                : null;

        const result = await pool.query(
            `UPDATE tasks
             SET title = $1,
                 description = $2,
                 priority = $3,
                 status = $4,
                 category_id = $5,
                 due_date = $6,
                 completed_at = $7
             WHERE id = $8 AND user_id = $9
             RETURNING *`,
            [
                title,
                description,
                priority,
                status,
                category_id || null,
                due_date || null,
                completedAt,
                id,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update task"
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete task"
        });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
