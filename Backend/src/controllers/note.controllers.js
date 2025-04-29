import { json } from "express";
import { ProjectNote } from "../models/note.models.js"
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

const getNotes = asyncHandler(async (req, res) => {
  const project = req.params.projectId;
  const allNotes = await ProjectNote.getNotesByCondition(null, project);
  res.status(200).json( new ApiResponse(200, {notes: allNotes}, "Notes fetch successfuly") )
});

const getNoteById = asyncHandler(async (req, res) => {
  // get note by id
});

const createNote = asyncHandler(async (req, res) => {
  const project = req.params.projectId,
    createdBy = req.user._id;
  const { content } = req.body;
  const isCreated = await ProjectNote.create({
    project,
    createdBy,
    content
  });

  res.status(201), json(new ApiResponse(201, { notes: isCreated }, "Notes created successfully."))
});

const updateNote = asyncHandler(async (req, res) => {
  const { content, _id, project } = req.body;
  const createdBy = req.user._id
  const isNotesExist = await ProjectNote.getNotesByCondition(_id);
  if (!isNotesExist) throw new ApiError(404, "Notes does not exist");
  await ProjectNote.updateOne({ _id }, { content, _id, project, createdBy });
  res.status(200), json(new ApiResponse(200, { notes: isCreated }, "Notes Updated successfully."))
});

const deleteNote = asyncHandler(async (req, res) => {
  const notesId = req.user.notesId;
  await ProjectNote.deleteOne({ id: notesId });
  res.status(204), json(new ApiResponse(204, { notes: isCreated }, "Notes deleted successfully."))
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
