import mongoose, { Schema } from "mongoose";

const projectNoteSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

projectNoteSchema.statics.getNotesByCondition = function(notesId, projectId){
  const condObj = {};
if(notesId) condObj["_id"] = new mongoose.Types.ObjectId(notesId);
if(projectId) condObj["project"] = new mongoose.Types.ObjectId(projectId);
  return this.aggregate([
    {
      $match : condObj
    }
  ])
}

export const ProjectNote = mongoose.model("ProjectNote", projectNoteSchema);
