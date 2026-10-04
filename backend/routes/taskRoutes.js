const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

router.get("/", authenticate, getTasks);
router.post("/", authenticate, createTask);
router.put("/:id", authenticate, updateTask);
router.delete("/:id", authenticate, deleteTask);

module.exports = router;
