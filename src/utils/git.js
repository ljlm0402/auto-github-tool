const { spawnSync } = require("child_process");
const logger = require("./logger");

/**
 * 실행 가능한 명령어를 실행하고 결과를 반환
 */
function executeCommand(command, args = []) {
  logger.logCommand(command, args);

  const result = spawnSync(command, args, { encoding: "utf-8", stdio: "pipe" });

  if (result.error) {
    logger.error("Command execution failed", {
      command,
      args,
      error: result.error.message,
    });
    throw new Error(`❌ Command execution failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    logger.error("Command returned error", {
      command,
      args,
      stderr: result.stderr,
      exitCode: result.status,
    });
    throw new Error(`❌ Command returned an error: ${result.stderr}`);
  }

  logger.debug("Command executed successfully", {
    command,
    args,
    outputLength: result.stdout.length,
  });

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

/**
 * 브랜치 삭제
 */
function deleteBranch(branchName, deleteLocal = true, deleteRemote = false) {
  if (deleteLocal) {
    try {
      // 강제 삭제 (-D) 사용
      executeCommand("git", ["branch", "-D", branchName]);
      logger.info("Local branch deleted", { branchName });
    } catch (error) {
      logger.error("Failed to delete local branch", {
        branchName,
        error: error.message,
      });
      throw new Error(
        `Failed to delete local branch '${branchName}': ${error.message}`
      );
    }
  }

  if (deleteRemote) {
    try {
      executeCommand("git", ["push", "origin", "--delete", branchName]);
      logger.info("Remote branch deleted", { branchName });
    } catch (error) {
      logger.error("Failed to delete remote branch", {
        branchName,
        error: error.message,
      });
      throw new Error(
        `Failed to delete remote branch '${branchName}': ${error.message}`
      );
    }
  }
}

/**
 * 브랜치 동기화 상태 확인
 * @returns {Object} { isSynced, behind, ahead }
 */
function checkBranchSync(currentBranch, baseBranch) {
  try {
    // origin에서 최신 정보 가져오기 (fetch)
    logger.debug("Fetching latest from origin", { currentBranch, baseBranch });
    executeCommand("git", ["fetch", "origin", baseBranch]);

    // 현재 브랜치가 베이스 브랜치보다 몇 커밋 뒤처져 있는지
    const behind = executeCommand("git", [
      "rev-list",
      "--count",
      `${currentBranch}..origin/${baseBranch}`,
    ]).trim();

    // 현재 브랜치가 베이스 브랜치보다 몇 커밋 앞서 있는지
    const ahead = executeCommand("git", [
      "rev-list",
      "--count",
      `origin/${baseBranch}..${currentBranch}`,
    ]).trim();

    const isSynced = behind === "0";

    logger.info("Branch sync status checked", {
      currentBranch,
      baseBranch,
      isSynced,
      behind,
      ahead,
    });

    return {
      isSynced,
      behind: parseInt(behind, 10),
      ahead: parseInt(ahead, 10),
    };
  } catch (error) {
    logger.error("Failed to check branch sync", {
      currentBranch,
      baseBranch,
      error: error.message,
    });
    throw new Error(`Failed to check branch sync: ${error.message}`);
  }
}

/**
 * 브랜치 동기화 (rebase)
 */
function syncBranch(baseBranch) {
  try {
    logger.info("Syncing branch with rebase", { baseBranch });
    executeCommand("git", ["pull", "--rebase", "origin", baseBranch]);
    logger.info("Branch synced successfully", { baseBranch });
  } catch (error) {
    logger.error("Failed to sync branch", {
      baseBranch,
      error: error.message,
    });
    throw new Error(`Failed to sync branch: ${error.message}`);
  }
}

module.exports = {
  executeCommand,
  validateGitRepository,
  getCurrentBranch,
  getBranches,
  getCommitCount,
  createBranch,
  pushBranch,
  deleteBranch,
  checkBranchSync,
  syncBranch,
};
