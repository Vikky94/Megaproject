import { Router } from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectMembers, addMemberToProject, getMembers, deleteMember, updateMemberRole } from '../controllers/project.controllers.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js'
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator, updateProjectValidator, addMemberToProjectValidator } from "../validators/index.js";

const router = Router()

router.post('/create-project', isLoggedIn, createProjectValidator(), validate, createProject);
router.get('/get-projects', isLoggedIn, getProjects);
router.get('/get-project/:projectId', isLoggedIn, getProjectById);
router.patch('/update-project', isLoggedIn, updateProjectValidator(), validate, updateProject);
router.delete('/delete-project/:projectId', isLoggedIn, deleteProject);

router.get('/get-members', isLoggedIn, getMembers);
router.get('/get-project-members/:projectId', isLoggedIn, getProjectMembers);
router.post('/add-project-member', isLoggedIn, addMemberToProjectValidator(), validate, addMemberToProject);
router.delete('/delete-member/:projectId/:memberId', isLoggedIn, deleteMember);
router.patch('/update-member-role', isLoggedIn, updateMemberRole);



export default router