import { Router } from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject} from '../controllers/project.controllers.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/create-project', isLoggedIn, createProject);
router.get('/get-projects', isLoggedIn, getProjects);
router.get('/get-project/:projectId', isLoggedIn, getProjectById);
router.post('/update-project', isLoggedIn, updateProject);
router.get('/delete-project/:projectId', isLoggedIn, deleteProject);



export default router