const chalk = require("chalk");
const { fetchOpenIssues, validateGitHubCLI } = require("../utils/github");
const { validateGitRepository } = require("../utils/git");
const { handleError } = require("../utils/validator");

/**
 * 오픈된 이슈 목록 표시
 */
async function listCommand() {
  try {
    validateGitRepository();
    validateGitHubCLI();

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
  } catch (error) {
    handleError(error, "list command");
  }
}

module.exports = listCommand;
