const { executeCommand } = require("./git");
const cache = require("./cache");
const logger = require("./logger");
const { CACHE_TTL } = require("../constants");

/**
 * GitHub CLI가 설치되어 있는지 확인
 */
function validateGitHubCLI() {
  try {
    executeCommand("gh", ["--version"]);
    return true;
  } catch {
    throw new Error(
      "❌ GitHub CLI is not installed. Please install it before proceeding."
    );
  }
}

/**
 * 현재 사용자 정보 가져오기
 */
function getCurrentUser() {
  try {
    return executeCommand("gh", ["api", "user", "-q", ".login"]);
  } catch (error) {
    throw new Error(
      "❌ Failed to get current user. Please ensure you are logged in with 'gh auth login'."
    );
  }
}

/**
 * GitHub 저장소에서 라벨 목록을 가져옴 (캐싱 적용)
 */
function fetchLabels() {
  const cacheKey = "github:labels";

  // 캐시된 값 확인
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug("Using cached labels");
    return cached;
  }

  try {
    logger.debug("Fetching labels from GitHub");
    const labels = executeCommand("gh", [
      "label",
      "list",
      "--json",
      "name",
      "-q",
      ".[] | .name",
    ]);
    if (!labels.trim()) {
      return [];
    }
    const labelList = labels.split("\n").map((label) => label.trim());

    // 캐시에 저장 (5분)
    cache.set(cacheKey, labelList, CACHE_TTL.LABELS);

    return labelList;
  } catch (error) {
    logger.error("Failed to fetch labels", { error: error.message });
    console.error("❌ Failed to fetch labels:", error.message);
    return [];
  }
}

/**
 * 오픈된 GitHub 이슈 목록 조회 (캐싱 적용)
 */
function fetchOpenIssues() {
  const cacheKey = "github:openIssues";

  // 캐시된 값 확인 (이슈는 자주 변경되므로 1분만 캐싱)
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug("Using cached open issues");
    return cached;
  }

  try {
    logger.debug("Fetching open issues from GitHub");
    const issues = executeCommand("gh", [
      "issue",
      "list",
      "--state",
      "open",
      "--json",
      "number,title,labels",
      "-q",
      ".[] | [.number, .title, .labels[0].name] | @tsv",
    ]);
    if (!issues.trim()) {
      return [];
    }
    const issueList = issues.split("\n").map((line) => {
      const [number, title, label] = line.split("\t");
      return { number, title, label: label || "none" };
    });

    // 캐시에 저장 (1분)
    cache.set(cacheKey, issueList, CACHE_TTL.ISSUES);

    return issueList;
  } catch (error) {
    logger.error("Failed to fetch open issues", { error: error.message });
    throw new Error("❌ Unable to fetch open issues: " + error.message);
  }
}

/**
 * 오픈된 GitHub PR 목록 조회 (캐싱 적용)
 */
function fetchOpenPRs() {
  const cacheKey = "github:openPRs";

  // 캐시된 값 확인 (PR은 자주 변경되므로 1분만 캐싱)
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug("Using cached open PRs");
    return cached;
  }

  try {
    logger.debug("Fetching open PRs from GitHub");
    const prs = executeCommand("gh", [
      "pr",
      "list",
      "--state",
      "open",
      "--json",
      "number,title,headRefName,isDraft",
      "-q",
      ".[] | [.number, .title, .headRefName, .isDraft] | @tsv",
    ]);
    if (!prs.trim()) {
      return [];
    }
    const prList = prs.split("\n").map((line) => {
      const [number, title, branch, isDraft] = line.split("\t");
      return {
        number,
        title,
        branch,
        isDraft: isDraft === "true",
      };
    });

    // 캐시에 저장 (1분)
    cache.set(cacheKey, prList, CACHE_TTL.PULL_REQUESTS);

    return prList;
  } catch (error) {
    logger.error("Failed to fetch open PRs", { error: error.message });
    throw new Error("❌ Unable to fetch open PRs: " + error.message);
  }
}

/**
 * GitHub 이슈 생성
 */
function createIssue(title, body, assignees, labels, milestone) {
  const args = ["issue", "create", "--title", title, "--body", body];
  if (assignees) args.push("--assignee", assignees);
  if (labels && labels.length) args.push("--label", labels.join(","));
  if (milestone) args.push("--milestone", milestone);

  return executeCommand("gh", args);
}

/**
 * GitHub PR 생성
 */
function createPullRequest(
  title,
  body,
  head,
  base,
  reviewers,
  assignees,
  labels,
  milestone,
  isDraft = false
) {
  const args = [
    "pr",
    "create",
    "--title",
    title,
    "--body",
    body,
    "--head",
    head,
    "--base",
    base,
  ];
  if (reviewers) args.push("--reviewer", reviewers);
  if (assignees) args.push("--assignee", assignees);
  if (labels && labels.length) args.push("--label", labels.join(","));
  if (milestone) args.push("--milestone", milestone);
  if (isDraft) args.push("--draft");

  return executeCommand("gh", args);
}

/**
 * GitHub 라벨 생성
 */
function createLabel(name, color, description) {
  const args = ["label", "create", name, "--color", color];
  if (description) args.push("--description", description);

  return executeCommand("gh", args);
}

module.exports = {
  validateGitHubCLI,
  getCurrentUser,
  fetchLabels,
  fetchOpenIssues,
  fetchOpenPRs,
  createIssue,
  createPullRequest,
  createLabel,
};
