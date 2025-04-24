import { asyncHandler } from "../utils/async-handler.js";
import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { TaskStatusEnum } from "../utils/constants.js";
import { SubTask } from "../models/subtask.models.js";
import { Project } from "../models/project.models.js";


const getTasks = asyncHandler(async (req, res) => {
  if (!req.params.projectId) throw new ApiError(400, "ProjectId is required");
  // const tasksData = await Task.getTaskDetails(req.params.projectId);
  const tasksData = await Project.getProjectTasksById(req.params.projectId);
  res.status(200).json(new ApiResponse(200, { tasks: tasksData }, "Tasks fetched successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  if (!req.params.taskId) throw new ApiError(400, "TaskId is required");
  const taskData = await Task.getTaskDetails(null,req.params.taskId);
  res.status(200).json(new ApiResponse(200, { task: taskData }, "Tasks fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { _id } = req.user;
  const status1 = status ?? TaskStatusEnum.TODO 
  const createTaskObj = { title,description, assignedTo,"status":status1, "project":req.params.projectId,"assignedBy":_id}
  const isTaskExist = await Task.findOne({title, "project":req.params.projectId});
  if( isTaskExist ) throw new ApiError(400, "Task already exist.");

  const isTaskCreated = await Task.create(createTaskObj);
  if( !isTaskCreated ) throw new ApiError(400, "Failed to add task")
  res.status(201).json(new ApiResponse(201, "Tasks added successfully"));
});


const updateTask = asyncHandler(async (req, res) => {
  const { _id, title, description, assignedTo, project, status } = req.body;
  const status1 = status ?? TaskStatusEnum.TODO 
  const createTaskObj = { title,description, assignedTo,"status":status1, project}

  const isTaskExist = await Task.findOne( { $and : [ {title}, {project}, { _id : {$ne : _id} } ] } );
  if( isTaskExist ) throw new ApiError(400, "Task already exist.");

  const isTaskCreated = await Task.updateOne(_id, createTaskObj);
  if( !isTaskCreated ) throw new ApiError(400, "Failed to update task")
  res.status(200).json(new ApiResponse(200, "Tasks updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const isTaskExist = await Task.findById({_id: req.params.taskId});
  if( !isTaskExist ) throw new ApiError(400, "Task does not exist");

  const isTaskDeleted = await Task.deleteOne({_id: req.params.taskId});
  if( !isTaskDeleted ) throw new ApiError(400, "Failed to delete task.");
  res.status(200).json(new ApiResponse(200, "Tasks deleted successfully"));
});

const getSubTasks = asyncHandler(async (req, res) => {
  const subTasks = await Task.getSubTask(req.params.taskId);
  res.status(200).json(new ApiResponse(200, { subTasks: subTasks }, "subTasks fetched successfully"));
});

const getSubTaskById = asyncHandler(async (req, res) => {
  const subTask = await SubTask.getSubTaskDetails(req.params.subTaskId);
  res.status(200).json(new ApiResponse(200, { subTask: subTask.length ? subTask[0]:{}   }, "subTask Details fetched successfully"));
});

const createSubTask = asyncHandler(async (req, res) => {
  const taskId = req.params.taskId,
  {title, isCompleted} = req.body,
  createdBy = req.user._id;

  const isTaskExist = await Task.findById(taskId);
  if( !isTaskExist )  throw new ApiError(404, "Task does not exist");

  const isSubTaskCreated = await SubTask.create({title, isCompleted ,task:taskId,createdBy});
  if( !isSubTaskCreated ) throw new ApiError(400, "Failed to add subtask");

  res.status(201).json(new ApiResponse(201, "Subtask added successfully"))
});


const updateSubTask = asyncHandler(async (req, res) => {
  const {_id,title,isCompleted, task} = req.body,
  createdBy = req.user._id;

  const isSubTaskExist = await SubTask.findOne({ $and: [{title}, {task}, {createdBy}, { _id : {$ne : _id} }] });
  if( isSubTaskExist )  throw new ApiError(404, "Sub already exist");

  const isSubTaskUpdated = await SubTask.updateOne({_id}, {title, isCompleted ,task,createdBy});
  if( !isSubTaskUpdated ) throw new ApiError(400, "Failed to update subtask");
  res.status(200).json(new ApiResponse(200, "Subtask updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const isSubTaskDeleted = await SubTask.deleteOne({_id: req.params.subTaskId});
  if( !isSubTaskDeleted ) throw new ApiError(400, "Failed to delete subtask");
  res.status(200).json(new ApiResponse(204, "Subtask deleted successfully"));
});

export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
  getSubTasks,
  getSubTaskById
};
