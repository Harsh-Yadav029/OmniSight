import { BuildRun } from '../models/build-run.model.js';
import { FixAttempt } from '../models/fix-attempt.model.js';
import { PullRequestRecord } from '../models/pull-request-record.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getRuns = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const totalRuns = await BuildRun.countDocuments();
  const runs = await BuildRun.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        runs,
        pagination: {
          total: totalRuns,
          page,
          limit,
          totalPages: Math.ceil(totalRuns / limit) || 1,
        },
      },
      'Build runs retrieved successfully'
    )
  );
});

export const getRunById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const run = await BuildRun.findById(id);
  if (!run) {
    throw new ApiError(404, `BuildRun with id ${id} not found`);
  }

  const fixAttempts = await FixAttempt.find({ buildRunId: id }).sort({ attemptNumber: 1 });
  const pullRequestRecord = await PullRequestRecord.findOne({ buildRunId: id }).populate(
    'decidedBy',
    'name email role'
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        run,
        fixAttempts,
        pullRequestRecord,
      },
      'Build run details retrieved successfully'
    )
  );
});

export const updateRunDecision = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;

  if (!['approved', 'rejected'].includes(decision)) {
    throw new ApiError(400, 'Decision must be either "approved" or "rejected"');
  }

  const run = await BuildRun.findById(id);
  if (!run) {
    throw new ApiError(404, `BuildRun with id ${id} not found`);
  }

  let prRecord = await PullRequestRecord.findOne({ buildRunId: id });
  if (prRecord) {
    prRecord.decision = decision;
    prRecord.decidedBy = req.user._id;
    prRecord.decidedAt = new Date();
    await prRecord.save();
  }

  run.status = decision;
  await run.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        run,
        pullRequestRecord: prRecord,
      },
      `Build run successfully marked as ${decision}`
    )
  );
});
