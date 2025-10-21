const { executeCommand } = require("./git");

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
 * GitHub 저장소에서 라벨 목록을 가져옴
 */
function fetchLabels() {
  try {
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
    return labels.split("\n").map((label) => label.trim());
  } catch (error) {
    console.error("❌ Failed to fetch labels:", error.message);
    return [];
  }
}

/**
 * 오픈된 GitHub 이슈 목록 조회
 */
function fetchOpenIssues() {
  try {
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
    return issues.split("\n").map((line) => {
      const [number, title, label] = line.split("\t");
      return { number, title, label: label || "none" };
    });
  } catch (error) {
    throw new Error("❌ Unable to fetch open issues: " + error.message);
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
  milestone
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
  createIssue,
  createPullRequest,
  createLabel,
};
