import mongoose, { Schema } from 'mongoose';

const buildRunSchema = new Schema(
  {
    repo: {
      type: String,
      required: [true, 'Repository name is required'],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    commitSha: {
      type: String,
      required: [true, 'Commit SHA is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'screenshots_captured',
        'analyzing',
        'fix_applied',
        'verified',
        'pr_opened',
        'approved',
        'rejected',
        'failed',
      ],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BuildRun = mongoose.model('BuildRun', buildRunSchema);
