import { BuildRun } from '../models/build-run.model.js';
import { FixAttempt } from '../models/fix-attempt.model.js';
import { PullRequestRecord } from '../models/pull-request-record.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createInternalRun = asyncHandler(async (req, res) => {
  const { repo, branch, commitSha, commit_sha } = req.body;
  const sha = commitSha || commit_sha;

  if (!repo || !branch || !sha) {
    throw new ApiError(400, 'repo, branch, and commitSha are required');
  }

  const run = await BuildRun.create({
    repo,
    branch,
    commitSha: sha,
    status: 'pending',
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { runId: run._id, run }, 'BuildRun created successfully'));
});

export const updateInternalRun = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, fixAttempt, pullRequest } = req.body;

  const run = await BuildRun.findById(id);
  if (!run) {
    throw new ApiError(404, `BuildRun with id ${id} not found`);
  }

  if (status) {
    run.status = status;
    await run.save();
  }

  let createdFixAttempt = null;
  if (fixAttempt) {
    const nextAttemptNumber =
      fixAttempt.attemptNumber ||
      ((await FixAttempt.countDocuments({ buildRunId: id })) + 1);

    createdFixAttempt = await FixAttempt.create({
      buildRunId: id,
      attemptNumber: nextAttemptNumber,
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
      { buildRunId: id },
      {
        buildRunId: id,
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
});

export const createPullRequestRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { prUrl, pr_url, branch, branchName, title, body } = req.body;

  const finalPrUrl = prUrl || pr_url;
  const finalBranch = branch || branchName;

  if (!finalPrUrl) {
    throw new ApiError(400, 'prUrl is required');
  }

  const run = await BuildRun.findById(id);
  if (!run) {
    throw new ApiError(404, `BuildRun with id ${id} not found`);
  }

  const prRecord = await PullRequestRecord.findOneAndUpdate(
    { buildRunId: id },
    {
      buildRunId: id,
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
});
