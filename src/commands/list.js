const chalk = require("chalk");
const inquirer = require("inquirer");
const {
  fetchOpenIssues,
  fetchOpenPRs,
  validateGitHubCLI,
} = require("../utils/github");
const { validateGitRepository } = require("../utils/git");
const { handleError } = require("../utils/validator");

/**
 * 오픈된 이슈 목록 표시
 */
async function listCommand() {
  try {
    validateGitRepository();
    validateGitHubCLI();

    // 사용자에게 이슈 또는 PR 선택하도록 함
    const { listType } = await inquirer.prompt([
      {
        type: "list",
        name: "listType",
        message: "📋 What would you like to list?",
        choices: [
          { name: "📋 Issues", value: "issues" },
          { name: "🔀 Pull Requests", value: "prs" },
        ],
      },
    ]);

    if (listType === "issues") {
      await listIssues();
    } else {
      await listPRs();
    }
  } catch (error) {
    handleError(error, "list command");
  }
}

/**
 * 이슈 목록 표시
 */
async function listIssues() {
  const issues = fetchOpenIssues();

  if (!issues.length) {
    console.log(chalk.green("\n✅ No open issues found.\n"));
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

  console.log("");
}

/**
 * PR 목록 표시
 */
async function listPRs() {
  const prs = fetchOpenPRs();

  if (!prs.length) {
    console.log(chalk.green("\n✅ No open pull requests found.\n"));
    return;
  }

  console.log(chalk.bold.cyan("\n=== 🔀 Open Pull Requests ===\n"));

  prs.forEach((pr) => {
    const draftText = pr.isDraft
      ? chalk.yellow("[DRAFT]")
      : chalk.green("[READY]");
    const branchText = chalk.gray(`(${pr.branch})`);
    console.log(
      `${chalk.bold.white(pr.number)} ${pr.title} ${draftText} ${branchText}`
    );
  });

  console.log("");
}

module.exports = listCommand;
