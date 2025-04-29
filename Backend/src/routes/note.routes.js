import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { getNotes, getNoteById, createNote, updateNote, deleteNote } from "../controllers/note.controllers.js"

const router = Router();

router.get('/get-all-notes/:projectId', isLoggedIn, getNotes);
router.get('/get-notes/:notesId', isLoggedIn, getNoteById);
router.get('/create-notes/:projectId', isLoggedIn, createNote);
router.get('/update-notes', isLoggedIn, updateNote);
router.get('/delete-notes/:notesId', isLoggedIn, deleteNote);

export default router