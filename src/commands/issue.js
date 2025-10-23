const inquirer = require("inquirer");
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
const logger = require("../utils/logger");

/**
 * GitHub 이슈 생성
 */
async function issueCommand() {
  let spinner = ora();

  try {
    spinner.start("Validating environment...");
    validateGitRepository();
    validateGitHubCLI();
    spinner.succeed("Environment validated");

    spinner.start("Loading configuration...");
    const config = loadConfig();
    spinner.succeed("Configuration loaded");

    // 1. 이슈 제목 입력
    const { title } = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "📍 Enter issue title:",
        validate: (input) => {
          return input.trim() !== "" || "Issue title cannot be empty";
        },
      },
    ]);

    logger.info("Issue title entered", { title });

    // 2. 이슈 템플릿 또는 설명 입력
    let body = await fetchIssueTemplate();

    if (!body) {
      const { description } = await inquirer.prompt([
        {
          type: "input",
          name: "description",
          message: "📝 Enter issue description:",
          validate: (input) => {
            return input.trim() !== "" || "Description cannot be empty";
          },
        },
      ]);
      body = description;
    }

    // 3. Assignees 설정
    const { assigneesInput } = await inquirer.prompt([
      {
        type: "input",
        name: "assigneesInput",
        message:
          "👥 Enter assignees (comma-separated, or press Enter to skip):",
      },
    ]);

    let assignees = assigneesInput;
    if (!assignees && config.autoAssign) {
      spinner = ora("Getting current user...").start();
      try {
        assignees = getCurrentUser();
        spinner.succeed(
          chalk.green(`Assignee set to your account: ${assignees}`)
        );
      } catch (error) {
        spinner.fail("Failed to get current user");
      }
    }

    // 4. 라벨 선택
    spinner = ora("Fetching labels...").start();
    const labels = fetchLabels();
    spinner.succeed(`Found ${labels.length} label(s)`);

    let selectedLabels = [];

    if (labels.length) {
      const { labelSelection } = await inquirer.prompt([
        {
          type: "checkbox",
          name: "labelSelection",
          message: "🏷 Select labels:",
          choices: labels.map((label) => ({ name: label, value: label })),
        },
      ]);
      selectedLabels = labelSelection;

      if (selectedLabels.length) {
        console.log(
          chalk.green("\n🏷️ Selected Labels:"),
          selectedLabels.join(", ")
        );
      }
    }

    // 5. Milestone 입력
    const { milestone } = await inquirer.prompt([
      {
        type: "input",
        name: "milestone",
        message: "📅 Enter milestone (or press Enter to skip):",
      },
    ]);

    // 6. 이슈 생성
    spinner = ora("Creating GitHub issue...").start();

    try {
      const result = createIssue(
        title,
        body,
        assignees,
        selectedLabels,
        milestone
      );
      spinner.succeed(chalk.green("GitHub issue created successfully"));

      logger.info("Issue created successfully", { title });

      console.log(chalk.gray("\n💡 Issue created successfully!\n"));
    } catch (error) {
      spinner.fail("Failed to create issue");
      throw error;
    }
  } catch (error) {
    if (spinner) spinner.stop();
    logger.error("Issue command failed", { error: error.message });
    handleError(error, "issue command");
  }
}

module.exports = issueCommand;
