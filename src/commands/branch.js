const readlineSync = require("readline-sync");
const chalk = require("chalk");
const ora = require("ora");
const { validateGitHubCLI, fetchOpenIssues } = require("../utils/github");
const { validateGitRepository, createBranch } = require("../utils/git");
const {
  validateIssueNumber,
  sanitizeBranchName,
  handleError,
} = require("../utils/validator");
const { loadConfig } = require("../utils/config");

/**
 * Git 브랜치 생성
 */
async function branchCommand() {
  try {
    validateGitRepository();
    validateGitHubCLI();

    const config = loadConfig();

    // 1. 이슈 목록 조회
    const issues = fetchOpenIssues();

    if (!issues.length) {
      console.log(chalk.yellow("\n⚠️  No open issues found.\n"));
      return;
    }

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

    // 2. 이슈 선택
    console.log("");
    const issueNumber = readlineSync.question(
      chalk.cyan("🔢 Enter issue number to create branch: ")
    );
    validateIssueNumber(issueNumber);

    const issue = issues.find((i) => i.number === issueNumber);
    if (!issue) {
      throw new Error("Issue not found. Please enter a valid issue number.");
    }

    // 3. 브랜치 타입 선택
    console.log(chalk.bold.cyan("\n📌 Select a branch type:"));
    config.branchTypes.forEach((branch) => {
      console.log(
        `[${branch.id}] ${chalk.bold(branch.name)} - ${branch.description}`
      );
    });

    console.log("");
    const branchTypeId = readlineSync.question(
      chalk.cyan("🔢 Enter the branch type number: ")
    );
    const selectedBranchType = config.branchTypes.find(
      (branch) => branch.id === branchTypeId
    );

    if (!selectedBranchType) {
      throw new Error("Invalid branch type selected.");
    }

    // 4. 브랜치 이름 생성
    const sanitizedTitle = sanitizeBranchName(issue.title);
    const branchName = `${selectedBranchType.name}/${issueNumber}-${sanitizedTitle}`;

    // 5. 브랜치 생성
    const spinner = ora(`Creating branch '${branchName}'...`).start();

    try {
      createBranch(branchName);
      spinner.succeed(
        chalk.green(
          `✅ Branch '${branchName}' has been successfully created.\n`
        )
      );
    } catch (error) {
      spinner.fail("Failed to create branch");
      throw error;
    }
  } catch (error) {
    handleError(error, "branch command");
  }
}

module.exports = branchCommand;
