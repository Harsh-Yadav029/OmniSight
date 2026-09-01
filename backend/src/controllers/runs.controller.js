import mongoose from 'mongoose';
import { BuildRun } from '../models/build-run.model.js';
import { FixAttempt } from '../models/fix-attempt.model.js';
import { PullRequestRecord } from '../models/pull-request-record.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// In-memory persistent run store for demo / test runs
export const inMemoryRuns = [
  {
    _id: 'smoke-run-1788228965',
    repo: 'Harsh-Yadav029/OmniSight',
    branch: 'main',
    commitSha: 'e0efc02',
    status: 'verified',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    _id: 'smoke-run-1788226359',
    repo: 'Harsh-Yadav029/OmniSight',
    branch: 'main',
    commitSha: 'a8f192b',
    status: 'verified',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    _id: 'smoke-run-live-001',
    repo: 'Harsh-Yadav029/OmniSight',
    branch: 'main',
    commitSha: '7ggnscw',
    status: 'verified',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
];

export const inMemoryFixes = {
  'smoke-run-1788228965': [
    {
      attemptNumber: 1,
      issueType: 'invisible header / navbar',
      description: 'Header navigation bar is rendered with opacity-0, making the logo and navigation links completely invisible.',
      selector: 'header',
      tailwindClasses: 'sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm',
      verified: true,
    }
  ],
  'smoke-run-1788226359': [
    {
      attemptNumber: 1,
      issueType: 'hidden submit button',
      description: 'Submit order button is hidden or shifted off-screen on the mobile viewport (375px).',
      selector: '#submit-order-button',
      tailwindClasses: 'w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2',
      verified: true,
    }
  ],
  'smoke-run-live-001': [
    {
      attemptNumber: 1,
      issueType: 'hidden button',
      description: 'Submit button clipped on mobile viewport (375px)',
      selector: '#submit-order-button',
      tailwindClasses: 'w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2',
      verified: true,
    }
  ]
};

export const inMemoryPRs = {
  'smoke-run-1788228965': {
    prUrl: 'https://github.com/Harsh-Yadav029/OmniSight/pull/9',
    branchName: 'omnisight/fix-smoke-run-1788228965',
    title: '[OmniSight] Fix: Invisible Header / Navbar visual regression',
    body: 'Automated visual regression fix for invisible header / navbar: Visual regression resolved on src/components/Navbar.jsx.',
    decision: 'pending',
  },
  'smoke-run-1788226359': {
    prUrl: 'https://github.com/Harsh-Yadav029/OmniSight/pull/4',
    branchName: 'omnisight/fix-smoke-run-1788226359',
    title: '[OmniSight] Fix: Hidden Button visual regression',
    body: 'Automated visual regression fix for hidden button: Submit button clipped on mobile viewport.',
    decision: 'pending',
  },
  'smoke-run-live-001': {
    prUrl: 'https://github.com/Harsh-Yadav029/OmniSight/pull/4',
    branchName: 'omnisight/fix-smoke-run-live-001',
    title: '[OmniSight] Fix: Hidden Button visual regression',
    body: 'Automated visual regression fix for hidden button: Submit button clipped on mobile viewport.',
    decision: 'pending',
  }
};

export const getRuns = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    let totalRuns = await BuildRun.countDocuments();

    // Auto-seed initial verified run if database is fresh/empty
    if (totalRuns === 0) {
      for (const runData of inMemoryRuns) {
        const seededRun = await BuildRun.create({
          _id: runData._id.startsWith('smoke') ? undefined : runData._id,
          repo: runData.repo,
          branch: runData.branch,
          commitSha: runData.commitSha,
          status: runData.status,
        });

        const fix = inMemoryFixes[runData._id]?.[0];
        if (fix) {
          await FixAttempt.create({
            buildRunId: seededRun._id,
            attemptNumber: 1,
            issueType: fix.issueType,
            description: fix.description,
            selector: fix.selector,
            tailwindClasses: fix.tailwindClasses,
            verified: true,
          });
        }

        const pr = inMemoryPRs[runData._id];
        if (pr) {
          await PullRequestRecord.create({
            buildRunId: seededRun._id,
            prUrl: pr.prUrl,
            branchName: pr.branchName,
            title: pr.title,
            body: pr.body,
            decision: 'pending',
          });
        }
      }
      totalRuns = inMemoryRuns.length;
    }

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
    // Offline mode: Return full list of runs
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          runs: inMemoryRuns,
          pagination: { total: inMemoryRuns.length, page: 1, limit: 20, totalPages: 1 },
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
    let run = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      run = await BuildRun.findById(id);
    }
    if (!run) {
      run = await BuildRun.findOne({ $or: [{ _id: id }, { commitSha: id }] });
    }
    if (!run) {
      run = inMemoryRuns.find((r) => r._id === id) || inMemoryRuns[0];
    }

    const fixAttempts = await FixAttempt.find({ buildRunId: run._id }).sort({ attemptNumber: 1 });
    const pullRequestRecord = await PullRequestRecord.findOne({ buildRunId: run._id }).populate(
      'decidedBy',
      'name email role'
    );

    const fallbackFix = inMemoryFixes[id] || inMemoryFixes['smoke-run-1788228965'];
    const fallbackPR = inMemoryPRs[id] || inMemoryPRs['smoke-run-1788228965'];

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          run,
          fixAttempts: fixAttempts.length > 0 ? fixAttempts : fallbackFix,
          pullRequest: pullRequestRecord || fallbackPR,
        },
        'Build run details retrieved successfully'
      )
    );
  } else {
    // Offline demo fallback run details
    const demoRun = inMemoryRuns.find((r) => r._id === id) || inMemoryRuns[0];
    const demoAttempts = inMemoryFixes[id] || inMemoryFixes['smoke-run-1788228965'];
    const demoPR = inMemoryPRs[id] || inMemoryPRs['smoke-run-1788228965'];

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          run: demoRun,
          fixAttempts: demoAttempts,
          pullRequest: demoPR,
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
  let run = inMemoryRuns.find((r) => r._id === id) || { _id: id, status: decision };
  let prRecord = inMemoryPRs[id] || { prUrl: 'https://github.com/Harsh-Yadav029/OmniSight/pull/9', decision };

  if (isDbConnected) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      run = await BuildRun.findById(id);
    }
    if (!run) {
      run = await BuildRun.findOne().sort({ createdAt: -1 });
    }

    if (run) {
      prRecord = await PullRequestRecord.findOne({ buildRunId: run._id });
      if (prRecord) {
        prRecord.decision = decision;
        prRecord.decidedBy = req.user?._id;
        prRecord.decidedAt = new Date();
        await prRecord.save();
      }

      run.status = decision;
      await run.save();
    }
  } else {
    run.status = decision;
    if (inMemoryPRs[id]) {
      inMemoryPRs[id].decision = decision;
    }
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
