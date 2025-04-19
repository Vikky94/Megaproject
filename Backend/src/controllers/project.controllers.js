import { asyncHandler } from "../utils/async-handler.js";
import { Project } from '../models/project.models.js';
import { User } from '../models/user.models.js';
import { ApiResponse } from '../utils/api-response.js'
import { ApiError } from "../utils/api-error.js";
import { ProjectMember } from "../models/projectmember.models.js"
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

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

  res.status(200).json(new ApiResponse(201, "Project added successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId, name, description } = req.body;
  if (!projectId) throw new ApiError(400, "Project Id is required");
  if (!name) throw new ApiError(400, "Project Name is required");

  const isProjectAlreadyExist = await Project.findProjectByCondition({ $and: [{ name }, { createdBy: req.user._id }, { _id: { $ne: projectId } }] });
  if (isProjectAlreadyExist.length) throw new ApiError(400, "Project name already exist");
  const isProjectUpdated = await Project.updateOne({ projectId }, { name, description });
  if (!isProjectUpdated) throw new ApiError(400, "Project update failed");
  res.status(200).json(new ApiResponse(200, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  if (!req.params.projectId) throw new ApiError(400, "Project id is required")
    const isProjectExist = await Project.findProjectByCondition({ _id :req.params.projectId });
    if (!isProjectExist) throw new ApiError(400, "Project does not exist");
    const isProjectDeleted = await Project.deleteOne({_id : req.params.projectId});
    if( !isProjectDeleted ) throw new ApiError(400, "Project deletion failed");
    res.status(200).json(new ApiResponse(200, "Project deleted successfully"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  if (!req.params.projectId) throw new ApiError(400, "Project id is required");
  const isProjectExist = await Project.findProjectByCondition({ _id :req.params.projectId });
  if (!isProjectExist) throw new ApiError(400, "Project does not exist");
  const projectMembers = await ProjectMember.find({project: req.params.projectId});
  res.status(200).json( new ApiResponse(200,{ projectMembers : projectMembers }, "Project members fetched successfully") );
});

const getUsers = asyncHandler(async (req, res) => {
  const allUsers = await User.find().select(['avatar', 'username', 'email','isEmailVerified']);
  res.status(200).json( new ApiResponse(200,{ users : allUsers }, "Users fetched successfully") );
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const {projectId, userId, role} = req.body;
  if (!projectId) throw new ApiError(400, "Project id is required");
  if (!userId) throw new ApiError(400, "userId id is required");

  const isProjectExist = await Project.findById(projectId);
  if (!isProjectExist) throw new ApiError(400, "Project does not exist");

  const isUserExist = await User.findById(userId);
  if (!isUserExist) throw new ApiError(400, "User does not exist");
  const obj = { user: userId, project: projectId, role: role }
  const isMemberAdded = await ProjectMember.create(obj);
  if( !isMemberAdded ) throw new ApiError(400, "Failed to add project member");
  res.status(200).json(new ApiResponse(201, "Project member added successfully"));
});

const deleteMember = asyncHandler(async (req, res) => {
 const projectId = req.params.projectId,
 memberId = req.params.memberId;
 if(!projectId || !memberId) throw new ApiError(400, "Invalid paramter")
 const isProjectExist = await Project.findById(projectId);
 if (!isProjectExist) throw new ApiError(400, "Project does not exist");

 const isMemberDeleted = await ProjectMember.deleteOne({project: projectId, user:memberId});
 if( !isMemberDeleted ) throw new ApiError(400, "Failed to delete project member");
 res.status(200).json(new ApiResponse(200, "Project member delete successfully"));

});

const updateMemberRole = asyncHandler(async (req, res) => {
  const {projectId, userId, role} = req.body;
  if (!projectId) throw new ApiError(400, "Project id is required");
  if (!userId) throw new ApiError(400, "userId id is required");

  const isUserExist = await User.findById(userId);
  if (!isUserExist) throw new ApiError(400, "User does not exist");
  
  const isProjectExist = await Project.findById(projectId);
  if (!isProjectExist) throw new ApiError(400, "Project does not exist");

  const isMemberExist = await ProjectMember.findOne({user: userId});
  if (!isMemberExist) throw new ApiError(400, "Project Member does not exist");


  const isMmeberRoleUpdated = await ProjectMember.updateOne({user: userId, project: projectId}, {role: role});
  if( !isMmeberRoleUpdated ) throw new ApiError(400, "Failed to update project member role");
  res.status(200).json(new ApiResponse(200, "Project member role successfully"));
});

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
  getUsers
};
