import { Router } from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectMembers, addMemberToProject, getUsers, deleteMember, updateMemberRole } from '../controllers/project.controllers.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js'
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator, updateProjectValidator, addMemberToProjectValidator } from "../validators/index.js";

const router = Router()

router.post('/create-project', isLoggedIn, createProjectValidator(), validate, createProject);
router.get('/get-projects', isLoggedIn, getProjects);
router.get('/get-project/:projectId', isLoggedIn, getProjectById);
router.post('/update-project', isLoggedIn, updateProjectValidator(), validate, updateProject);
router.get('/delete-project/:projectId', isLoggedIn, deleteProject);

router.get('/get-users', isLoggedIn, getUsers);
router.get('/get-project-members/:projectId', isLoggedIn, getProjectMembers);
router.post('/add-project-member', isLoggedIn, addMemberToProjectValidator(), validate, addMemberToProject);
router.get('/delete-member/:projectId/:memberId', isLoggedIn, deleteMember);
router.post('/update-member-role', isLoggedIn, updateMemberRole)
    .patch('/update-member-role', isLoggedIn, updateMemberRole);



export default router