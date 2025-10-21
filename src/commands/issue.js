const readlineSync = require("readline-sync");
const chalk = require("chalk");
const ora = require("ora");
const {
  validateGitHubCLI,
  getCurrentUser,
  fetchLabels,
  createIssue,
} = require("../utils/github");
const { validateGitRepository } = require("../utils/git");
const {
  validateNotEmpty,
  parseLabelsInput,
  handleError,
} = require("../utils/validator");
const { loadConfig } = require("../utils/config");
const { fetchIssueTemplate } = require("../templates");

/**
 * GitHub 이슈 생성
 */
async function issueCommand() {
  try {
    validateGitRepository();
    validateGitHubCLI();

    const config = loadConfig();

    // 1. 이슈 제목 입력
    console.log("");
    const title = validateNotEmpty(
      readlineSync.question(chalk.cyan("📍 Enter issue title: ")),
      "Issue title"
    );

    // 2. 이슈 템플릿 또는 설명 입력
    const body =
      (await fetchIssueTemplate()) ||
      readlineSync.question(chalk.cyan("📝 Enter issue description: "));

    // 3. Assignees 설정
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

    // 4. 라벨 선택
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

    // 5. Milestone 입력
    const milestone = readlineSync.question(
      chalk.cyan("\n📅 Enter milestone (or press Enter to skip): ")
    );

    // 6. 이슈 생성
    const spinner = ora("Creating GitHub issue...").start();

    try {
      const result = createIssue(
        title,
        body,
        assignees,
        selectedLabels,
        milestone
      );
      spinner.succeed(chalk.green("✅ GitHub issue created successfully."));
      console.log(result);
      console.log("");
    } catch (error) {
      spinner.fail("Failed to create issue");
      throw error;
    }
  } catch (error) {
    handleError(error, "issue command");
  }
}

module.exports = issueCommand;
