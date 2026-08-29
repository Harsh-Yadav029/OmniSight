import mongoose, { Schema } from 'mongoose';

const fixAttemptSchema = new Schema(
  {
    buildRunId: {
      type: Schema.Types.ObjectId,
      ref: 'BuildRun',
      required: true,
      index: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    issueType: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    selector: {
      type: String,
      default: '',
    },
    tailwindClasses: {
      type: String,
      default: '',
    },
    cssCode: {
      type: String,
      default: '',
    },
    screenshotBefore: {
      type: String,
      default: '',
    },
    screenshotAfter: {
      type: String,
      default: '',
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const FixAttempt = mongoose.model('FixAttempt', fixAttemptSchema);
