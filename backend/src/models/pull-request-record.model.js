import mongoose, { Schema } from 'mongoose';

const pullRequestRecordSchema = new Schema(
  {
    buildRunId: {
      type: Schema.Types.ObjectId,
      ref: 'BuildRun',
      required: true,
      unique: true,
      index: true,
    },
    prUrl: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    decision: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    decidedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const PullRequestRecord = mongoose.model('PullRequestRecord', pullRequestRecordSchema);
