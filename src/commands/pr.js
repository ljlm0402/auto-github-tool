const readlineSync = require("readline-sync");
const chalk = require("chalk");
const ora = require("ora");
const {
  validateGitHubCLI,
  getCurrentUser,
  fetchLabels,
  createPullRequest,
  fetchOpenIssues,
} = require("../utils/github");
const {
  validateGitRepository,
  getCurrentBranch,
  getBranches,
  getCommitCount,
  pushBranch,
} = require("../utils/git");
const {
  validateNotEmpty,
  parseLabelsInput,
  handleError,
} = require("../utils/validator");
const { loadConfig } = require("../utils/config");
const { fetchPRTemplate } = require("../templates");

/**
 * GitHub PR 생성
 */
async function prCommand() {
  try {
    validateGitRepository();
    validateGitHubCLI();

    const config = loadConfig();

    // 1. PR 제목 입력
    console.log("");
    const title = validateNotEmpty(
      readlineSync.question(chalk.cyan("📍 Enter PR title: ")),
      "PR title"
    );

    // 2. PR 템플릿 또는 설명 입력
    const body =
      (await fetchPRTemplate(() => {
        const issues = fetchOpenIssues();
        if (issues.length) {
          console.log(chalk.bold.cyan("\n=== 📋 Open Issues ===\n"));
          issues.forEach((issue) => {
            const labelText =
              issue.label !== "none"
                ? chalk.yellow(`[${issue.label}]`)
                : chalk.gray("[no label]");
            console.log(
              `${chalk.bold.white(issue.number)} ${issue.title} ${labelText}`
            );
          });
          console.log("");
        }
      })) || readlineSync.question(chalk.cyan("📝 Enter PR description: "));

    // 3. Reviewers 입력
    const reviewers = readlineSync.question(
      chalk.cyan(
        "👀 Enter reviewers (comma-separated, or press Enter to skip): "
      )
    );

    // 4. Assignees 설정
    let assignees = readlineSync.question(
      chalk.cyan(
        "👥 Enter assignees (comma-separated, or press Enter to skip): "
      )
    );
    if (!assignees && config.autoAssign) {
      const spinner = ora("Getting current user...").start();
      try {
        assignees = getCurrentUser();
        spinner.succeed(
          chalk.green(`👥 Assignee set to your account: ${assignees}`)
        );
      } catch (error) {
        spinner.fail("Failed to get current user");
      }
    }

    // 5. 라벨 선택
    const labels = fetchLabels();
    let selectedLabels = [];

    if (labels.length) {
      console.log(chalk.bold.cyan("\n=== 📋 Available Labels ==="));
      labels.forEach((label, index) => {
        const labelKey =
          index < 9
            ? `[${index + 1}]`
            : `[${String.fromCharCode(97 + index - 9)}]`;
        console.log(`${labelKey} ${label}`);
      });

      const labelInput = readlineSync.question(
        chalk.cyan("\n🏷 Select labels [1...9 / a, b, c]: ")
      );
      selectedLabels = parseLabelsInput(labelInput, labels);

      if (selectedLabels.length) {
        console.log(
          chalk.green("\n🏷️ Selected Labels:"),
          selectedLabels.join(", ")
        );
      }
    }

    // 6. Milestone 입력
    const milestone = readlineSync.question(
      chalk.cyan("\n📅 Enter milestone (or press Enter to skip): ")
    );

    // 7. Base 브랜치 선택
    const branches = getBranches();
    const defaultBase = config.defaultBaseBranch;

    console.log(chalk.bold.cyan("\n🌿 Available branches:"));
    branches.forEach((branch, index) => {
      const defaultMark =
        branch === defaultBase ? chalk.green(" (default)") : "";
      console.log(`[${index + 1}] ${branch}${defaultMark}`);
    });

    console.log("");
    const baseBranchIndex = readlineSync.question(
      chalk.cyan(`Select base branch (or press Enter for '${defaultBase}'): `)
    );

    const baseBranch = baseBranchIndex
      ? branches[parseInt(baseBranchIndex) - 1]
      : defaultBase;

    if (!baseBranch) {
      throw new Error("Invalid base branch selection.");
    }

    // 8. 현재 브랜치 확인
    const currentBranch = getCurrentBranch();
    console.log(chalk.gray(`\nCurrent branch: ${currentBranch}`));

    // 9. 커밋 확인
    const commitCount = getCommitCount(baseBranch, currentBranch);
    if (commitCount === "0") {
      throw new Error(
        `No commits found between '${baseBranch}' and '${currentBranch}'. ` +
          `Please commit your changes before creating a PR.`
      );
    }

    console.log(chalk.gray(`Found ${commitCount} commit(s) to push.\n`));

    // 10. 브랜치 푸시
    let spinner = ora(`Pushing branch '${currentBranch}' to remote...`).start();

    try {
      pushBranch(currentBranch);
      spinner.succeed(
        chalk.green(`✅ Branch '${currentBranch}' pushed successfully.`)
      );
    } catch (error) {
      spinner.fail("Failed to push branch");
      throw error;
    }

    // 11. PR 생성
    spinner = ora("Creating pull request...").start();

    try {
      const result = createPullRequest(
        title,
        body,
        currentBranch,
        baseBranch,
        reviewers,
        assignees,
        selectedLabels,
        milestone
      );

      spinner.succeed(chalk.green("✅ Pull request created successfully."));
      console.log(result);
      console.log("");
    } catch (error) {
      spinner.fail("Failed to create pull request");
      throw error;
    }
  } catch (error) {
    handleError(error, "pr command");
  }
}

module.exports = prCommand;
