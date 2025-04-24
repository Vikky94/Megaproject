import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatuses, TaskStatusEnum } from "../utils/constants.js";
const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: AvailableTaskStatuses,
      default: TaskStatusEnum.TODO,
    },
    attachments: {
      type: [
        {
          url: String,
          mimetype: String,
          size: Number,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

taskSchema.statics.getTaskDetails = function (project, _id) {
  const matchObj = {};
  if(_id) matchObj['_id'] = new mongoose.Types.ObjectId(_id)
  if(project) matchObj['project'] = new mongoose.Types.ObjectId(project);

  return this.aggregate([
    {
      $match: matchObj
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              avatar: 1,
              username: 1,
              email: 1,
              isEmailVerified: 1
            }
          }
        ],
        as: "assignedTo"
      }
    },
    {
      $unwind: "$assignedTo"
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              avatar: 1,
              username: 1,
              email: 1,
              isEmailVerified: 1
            }
          }
        ],
        as: "assignedBy"
      }
    },
    {
      $unwind: "$assignedBy"
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              description: 1
            }
          }
        ],
        as: "project"
      }
    },
    {
      $unwind: "$project"
    },
    {
      $project: {
        _id: 1,
        title: 1,
        status: 1,
        description: 1,
        attachments: 1,
        assignedTo: 1,
        project: 1,
        assignedToMemberDetails: 1,
        assignedBy: 1
      }
    }
  ])
}

taskSchema.statics.getSubTask = function (_id) {
  return this.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(_id)
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        status: 1
      }
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    avatar: 1,
                    username: 1,
                    email: 1,
                    isEmailVerified: 1
                  }
                }
              ],
              as: "createdBy"
            }
          },
          {
            $unwind: "$createdBy"
          }
        ],
        as: "subTasks"
      }
    }
  ])
}

export const Task = mongoose.model("Task", taskSchema);
