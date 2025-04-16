import { asyncHandler } from "../utils/async-handler.js";
import { Project } from '../models/project.models.js';
import { ApiResponse } from '../utils/api-response.js'
import { ApiError } from "../utils/api-error.js";
const getProjects = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const allProjects = await Project.find({ createdBy: _id });
  res.status(200).json(new ApiResponse(200, { projects: allProjects }, "Projects fetched successfully"))
});

const getProjectById = asyncHandler(async (req, res) => {
  if (!req.params.projectId) throw new ApiError(400, "Project id is required")

  const projectData = await Project.find({ _id: req.params.projectId });
  res.status(200).json(new ApiResponse(200, { project: projectData }, "Projects fetched successfully"))
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) throw new ApiError(400, "Project name is required");
  const isProjectAlreadyExist = await Project.findProjectByCondition({ name, createdBy: req.user._id });
  if (isProjectAlreadyExist.length) throw new ApiError(400, "Project name already exist");

  const isProjectCreated = await Project.create({ name, description, createdBy: req.user._id });
  if (!isProjectCreated) throw new ApiError(400, "Project not added");

  res.status(200).json(new ApiResponse(200, "Project added successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { _id, name, description } = req.body;
  if (!_id) throw new ApiError(400, "Project Id is required");
  if (!name) throw new ApiError(400, "Project Name is required");

  const isProjectAlreadyExist = await Project.findProjectByCondition({ $and: [{ name }, { createdBy: req.user._id }, { _id: { $ne: _id } }] });
  if (isProjectAlreadyExist.length) throw new ApiError(400, "Project name already exist");
  const isProjectUpdated = await Project.updateOne({ _id }, { name, description });
  if (!isProjectUpdated) throw new ApiError(400, "Project update failed");
  res.status(200).json(new ApiResponse(200, "Project updated successfully"));
});

const deleteProject = async (req, res) => {
  if (!req.params.projectId) throw new ApiError(400, "Project id is required")
    const isPorjectExist = await Project.findProjectByCondition({ _id :req.params.projectId });
    if (!isPorjectExist) throw new ApiError(400, "Project does not exist");
    const isProjectDeleted = await Project.deleteOne({_id : req.params.projectId});
    if( !isProjectDeleted ) throw new ApiError(400, "Project deletion failed");
    res.status(200).json(new ApiResponse(200, "Project deleted successfully"));
};

const getProjectMembers = async (req, res) => {
  // get project members
};

const addMemberToProject = async (req, res) => {
  // add member to project
};

const deleteMember = async (req, res) => {
  // delete member from project
};

const updateMemberRole = async (req, res) => {
  // update member role
};

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
