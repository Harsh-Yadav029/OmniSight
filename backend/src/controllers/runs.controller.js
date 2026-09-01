import mongoose from 'mongoose';
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

  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
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
  } else {
    // Offline demo fallback run
    const demoRuns = [
      {
        _id: 'demo-run-checkout-001',
        repo: 'Harsh-Yadav029/OmniSight',
        branch: 'main',
        commitSha: 'a8f192b',
        status: 'verified',
        createdAt: new Date(),
      },
    ];
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          runs: demoRuns,
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
        'Build runs retrieved (Demo Mode)'
      )
    );
  }
});

export const getRunById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
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
  } else {
    // Offline demo fallback run details
    const demoRun = {
      _id: id,
      repo: 'Harsh-Yadav029/OmniSight',
      branch: 'main',
      commitSha: 'a8f192b',
      status: 'verified',
      createdAt: new Date(),
    };

    const demoAttempts = [
      {
        attemptNumber: 1,
        issueType: 'hidden button',
        description: 'Submit button clipped on mobile viewport (375px)',
        selector: '#submit-order-button',
        tailwindClasses: 'w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2',
        verified: true,
      },
    ];

    const demoPR = {
      prUrl: 'https://github.com/Harsh-Yadav029/OmniSight/pull/101',
      branchName: `omnisight/fix-${id}`,
      decision: 'pending',
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          run: demoRun,
          fixAttempts: demoAttempts,
          pullRequestRecord: demoPR,
        },
        'Build run details retrieved (Demo Mode)'
      )
    );
  }
});

export const updateRunDecision = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, reason } = req.body;

  if (!['approved', 'rejected'].includes(decision)) {
    throw new ApiError(400, 'Decision must be either "approved" or "rejected"');
  }

  const isDbConnected = mongoose.connection.readyState === 1;
  let run = { _id: id, status: decision };
  let prRecord = { prUrl: 'https://github.com/Harsh-Yadav029/OmniSight/pull/101', decision };

  if (isDbConnected) {
    run = await BuildRun.findById(id);
    if (!run) {
      throw new ApiError(404, `BuildRun with id ${id} not found`);
    }

    prRecord = await PullRequestRecord.findOne({ buildRunId: id });
    if (prRecord) {
      prRecord.decision = decision;
      prRecord.decidedBy = req.user?._id;
      prRecord.decidedAt = new Date();
      await prRecord.save();
    }

    run.status = decision;
    await run.save();
  }

  // Sync decision to associated GitHub PR via ML Service Internal API
  let githubSynced = false;
  let githubWarning = null;

  if (prRecord && prRecord.prUrl) {
    const mlServiceUrl = (process.env.ML_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');
    const internalApiKey = process.env.INTERNAL_API_KEY || 'default_internal_key';
    const reviewerName = req.user?.name || req.user?.email || 'QA Manager';

    let action = 'comment';
    let message = `Approved by QA manager: ${reviewerName}`;
    if (decision === 'rejected') {
      action = 'close';
      message = reason
        ? `Rejected by QA manager: ${reviewerName} - Reason: ${reason}`
        : `Rejected by QA manager: ${reviewerName}`;
    }

    try {
      const response = await fetch(`${mlServiceUrl}/internal/pr-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Key': internalApiKey,
        },
        body: JSON.stringify({
          pr_url: prRecord.prUrl,
          action,
          message,
        }),
      });

      if (response.ok) {
        githubSynced = true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        githubWarning = errorData.detail || `ML-Service returned HTTP ${response.status}`;
      }
    } catch (err) {
      githubWarning = `Failed to contact ML Service for GitHub PR sync: ${err.message}`;
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        run,
        pullRequestRecord: prRecord,
        githubSynced,
        warning: githubWarning || undefined,
      },
      `Build run successfully marked as ${decision}`
    )
  );
});
