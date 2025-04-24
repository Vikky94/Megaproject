import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

projectSchema.statics.findProjectByCondition = function (condition) {
  return this.find(condition);
};
projectSchema.statics.getProjectDetails = function (createdBy, _id) {
  const createdByObjId = new mongoose.Types.ObjectId(createdBy),
        object_Id = new mongoose.Types.ObjectId(_id);
  let conditionObj = {createdBy : createdByObjId};
  if( _id ) conditionObj['_id'] = object_Id;

  return this.aggregate([
    {
      $match: conditionObj
    },
    {
      $lookup: {
        from: "projectmembers",
        localField: "_id",
        foreignField: "project",
        // pipeline: [
        //   {
        //     $match: {
        //       role: { $ne: "project_admin" }
        //     }
        //   }
        // ],
        as: "members"
      }
    },
    {
      $unwind: "$members"
    },
    {
      $lookup: {
        from: "users",
        localField: "members.user",
        foreignField: "_id",
        as: "userDetails"
      }
    },
    {
      $project: {
        "userDetails.password": 0,
        "userDetails.createdAt": 0,
        "userDetails.updatedAt": 0,
        "userDetails.emailVerificationExpiry": 0,
        "userDetails.emailVerificationToken": 0
      }
    },
    {
      $unwind: "$userDetails"
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        createdBy: { $first: "$createdBy" },
        projectMembers: {
          $push: {
            _id: "$members._id",
            role: "$members.role",
            createdBy: "$members.createdBy",
            createdAt: "$members.createdAt",
            updatedAt: "$members.updatedAt",
            userDetails: "$userDetails"
          }
        }
      }
    }
  ])
}

export const Project = mongoose.model("Project", projectSchema);
