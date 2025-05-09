import { Router } from "express";
import { isLoggedIn } from '../middlewares/auth.middleware.js'
import { validate } from "../middlewares/validator.middleware.js";
import { createTaskValidator, updateTaskValidator, subTaskValidator } from "../validators/index.js";
import { getTasks, getTaskById, createTask, updateTask, deleteTask, createSubTask, updateSubTask, deleteSubTask, getSubTasks, getSubTaskById } from "../controllers/task.controllers.js";

const router = Router();

router.get('/get-tasks/:projectId', isLoggedIn, getTasks)
router.get('/get-task/:taskId', isLoggedIn, getTaskById)
router.post('/create-task/:projectId', isLoggedIn, createTaskValidator(), validate, createTask);
router.patch('/update-task', isLoggedIn, updateTaskValidator(), validate, updateTask);
router.delete('/delete-task/:taskId', isLoggedIn, deleteTask);

router.get('/get-sub-tasks/:taskId', isLoggedIn, getSubTasks);
router.get('/get-sub-task/:subTaskId', isLoggedIn, getSubTaskById);
router.post('/create-sub-task/:taskId', isLoggedIn, subTaskValidator(), validate, createSubTask);
router.patch('/update-sub-task', isLoggedIn, subTaskValidator(), validate, updateSubTask);
router.delete('/delete-sub-task/:subTaskId', isLoggedIn, deleteSubTask);


export default router