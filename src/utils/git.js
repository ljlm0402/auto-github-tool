const { spawnSync } = require("child_process");

/**
 * 실행 가능한 명령어를 실행하고 결과를 반환
 */
function executeCommand(command, args = []) {
  const result = spawnSync(command, args, { encoding: "utf-8", stdio: "pipe" });
  if (result.error)
    throw new Error(`❌ Command execution failed: ${result.error.message}`);
  if (result.status !== 0)
    throw new Error(`❌ Command returned an error: ${result.stderr}`);
  return result.stdout.trim();
}

/**
 * Git 저장소인지 확인
 */
function validateGitRepository() {
  try {
    executeCommand("git", ["rev-parse", "--is-inside-work-tree"]);
    return true;
  } catch {
    throw new Error(
      "❌ This is not a Git repository. Please run 'git init' first."
    );
  }
}

/**
 * 현재 브랜치 가져오기
 */
function getCurrentBranch() {
  return executeCommand("git", ["branch", "--show-current"]).trim();
}

/**
 * 브랜치 목록 가져오기
 */
function getBranches() {
  return executeCommand("git", ["branch", "--list", "--remotes"])
    .split("\n")
    .map((branch) => branch.trim().replace("origin/", ""))
    .filter((branch) => branch && branch !== "HEAD");
}

/**
 * 커밋 수 확인
 */
function getCommitCount(baseBranch, currentBranch) {
  return executeCommand("git", [
    "rev-list",
    "--count",
    `${baseBranch}..${currentBranch}`,
  ]).trim();
}

/**
 * 브랜치 생성
 */
function createBranch(branchName) {
  executeCommand("git", ["checkout", "-b", branchName]);
}

/**
 * 브랜치 푸시
 */
function pushBranch(branchName) {
  executeCommand("git", ["push", "-u", "origin", branchName]);
}

module.exports = {
  executeCommand,
  validateGitRepository,
  getCurrentBranch,
  getBranches,
  getCommitCount,
  createBranch,
  pushBranch,
};
