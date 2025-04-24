import mongoose, { Schema } from "mongoose";

const subtaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

subtaskSchema.statics.getSubTaskDetails = function (_id) {
    return this.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(_id)
            }
        },
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
        },
        { $limit: 1 }
    ])
}

export const SubTask = mongoose.model("SubTask", subtaskSchema);
