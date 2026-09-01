import mongoose from 'mongoose';
import { BuildRun } from '../models/build-run.model.js';
import { FixAttempt } from '../models/fix-attempt.model.js';
import { PullRequestRecord } from '../models/pull-request-record.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { inMemoryRuns, inMemoryFixes, inMemoryPRs } from './runs.controller.js';

export const createInternalRun = asyncHandler(async (req, res) => {
  const { repo, branch, commitSha, commit_sha } = req.body;
  const sha = commitSha || commit_sha;

  if (!repo || !branch || !sha) {
    throw new ApiError(400, 'repo, branch, and commitSha are required');
  }

  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    const run = await BuildRun.create({
      repo,
      branch,
      commitSha: sha,
      status: 'pending',
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { runId: run._id, run }, 'BuildRun created successfully'));
  } else {
    const newRun = {
      _id: `run-${sha.substring(0, 7)}`,
      repo,
      branch,
      commitSha: sha,
      status: 'pending',
      createdAt: new Date(),
    };
    inMemoryRuns.unshift(newRun);

    return res
      .status(201)
      .json(new ApiResponse(201, { runId: newRun._id, run: newRun }, 'BuildRun created (In-Memory)'));
  }
});

export const updateInternalRun = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, fixAttempt, pullRequest } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    let run = await BuildRun.findById(id);
    if (!run) {
      run = await BuildRun.findOne({ commitSha: id });
    }

    if (run) {
      if (status) {
        run.status = status;
        await run.save();
      }

      let createdFixAttempt = null;
      if (fixAttempt) {
        createdFixAttempt = await FixAttempt.create({
          buildRunId: run._id,
          attemptNumber: fixAttempt.attemptNumber || 1,
          issueType: fixAttempt.issueType || '',
          description: fixAttempt.description || '',
          selector: fixAttempt.selector || '',
          tailwindClasses: fixAttempt.tailwindClasses || '',
          cssCode: fixAttempt.cssCode || '',
          screenshotBefore: fixAttempt.screenshotBefore || '',
          screenshotAfter: fixAttempt.screenshotAfter || '',
          resolved: fixAttempt.resolved || false,
        });
      }

      let prRecord = null;
      if (pullRequest) {
        prRecord = await PullRequestRecord.findOneAndUpdate(
          { buildRunId: run._id },
          {
            buildRunId: run._id,
            prUrl: pullRequest.prUrl || pullRequest.pr_url,
            branchName: pullRequest.branchName || pullRequest.branch,
            decision: pullRequest.decision || 'pending',
          },
          { upsert: true, new: true }
        );
      }

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            run,
            fixAttempt: createdFixAttempt,
            pullRequest: prRecord,
          },
          'BuildRun updated successfully'
        )
      );
    }
  }

  // Fallback in-memory update
  const memRun = inMemoryRuns.find((r) => r._id === id || r.commitSha === id);
  if (memRun && status) {
    memRun.status = status;
  }

  if (fixAttempt) {
    if (!inMemoryFixes[id]) inMemoryFixes[id] = [];
    inMemoryFixes[id].push({
      attemptNumber: fixAttempt.attemptNumber || inMemoryFixes[id].length + 1,
      issueType: fixAttempt.issueType || 'visual defect',
      description: fixAttempt.description || 'Defect resolved',
      selector: fixAttempt.selector || '',
      tailwindClasses: fixAttempt.tailwindClasses || '',
      resolved: fixAttempt.resolved || true,
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        run: memRun || { _id: id, status },
        fixAttempt,
      },
      'BuildRun updated in memory'
    )
  );
});

export const createPullRequestRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { prUrl, pr_url, branch, branchName, title, body } = req.body;

  const finalPrUrl = prUrl || pr_url;
  const finalBranch = branch || branchName;

  if (!finalPrUrl) {
    throw new ApiError(400, 'prUrl is required');
  }

  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    let run = await BuildRun.findById(id);
    if (!run) {
      run = await BuildRun.findOne({ commitSha: id });
    }

    if (run) {
      const prRecord = await PullRequestRecord.findOneAndUpdate(
        { buildRunId: run._id },
        {
          buildRunId: run._id,
          prUrl: finalPrUrl,
          branchName: finalBranch || `omnisight/fix-${id}`,
          decision: 'pending',
        },
        { upsert: true, new: true }
      );

      run.status = 'pr_created';
      await run.save();

      return res.status(201).json(
        new ApiResponse(201, { pullRequest: prRecord, run }, 'Pull Request record saved successfully')
      );
    }
  }

  inMemoryPRs[id] = {
    prUrl: finalPrUrl,
    branchName: finalBranch || `omnisight/fix-${id}`,
    title: title || '[OmniSight] Fix: Visual regression',
    body: body || 'Automated visual regression fix applied.',
    decision: 'pending',
  };

  const memRun = inMemoryRuns.find((r) => r._id === id || r.commitSha === id);
  if (memRun) {
    memRun.status = 'pr_created';
  }

  return res.status(201).json(
    new ApiResponse(201, { pullRequest: inMemoryPRs[id], run: memRun }, 'Pull Request record saved in memory')
  );
});
