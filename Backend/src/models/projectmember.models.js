import mongoose, { Schema } from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";
const projectMemberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.MEMBER,
    },
  },
  { timestamps: true },
);
projectMemberSchema.statics.getProjectMembers = function (project) {
  const projectObjId = new mongoose.Types.ObjectId(project);
  return this.aggregate([
    {
      $match: {
        project: projectObjId
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
              isEmailVerified: 1
            }
          }
        ],
        as: "userDetails"
      }
    },
    {
      $unwind: "$userDetails"
    }
  ])
}

export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema,
);
