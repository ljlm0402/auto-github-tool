const inquirer = require("inquirer");
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
  checkBranchSync,
  syncBranch,
} = require("../utils/git");
const {
  validateNotEmpty,
  parseLabelsInput,
  handleError,
} = require("../utils/validator");
const { loadConfig } = require("../utils/config");
const { fetchPRTemplate } = require("../templates");
const logger = require("../utils/logger");

/**
 * GitHub PR 생성
 */
async function prCommand() {
  let spinner = ora();

  try {
    spinner.start("Validating environment...");
    validateGitRepository();
    validateGitHubCLI();
    spinner.succeed("Environment validated");

    spinner.start("Loading configuration...");
    const config = loadConfig();
    spinner.succeed("Configuration loaded");

    // 1. PR 제목 입력
    const { title } = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "📍 Enter PR title:",
        validate: (input) => {
          return input.trim() !== "" || "PR title cannot be empty";
        },
      },
    ]);

    logger.info("PR title entered", { title });

    // 2. PR 템플릿 또는 설명 입력
    let body = await fetchPRTemplate(() => {
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
    });

    if (!body) {
      const { description } = await inquirer.prompt([
        {
          type: "input",
          name: "description",
          message: "📝 Enter PR description:",
          validate: (input) => {
            return input.trim() !== "" || "Description cannot be empty";
          },
        },
      ]);
      body = description;
    }

    // 3. Reviewers 입력
    const { reviewers } = await inquirer.prompt([
      {
        type: "input",
        name: "reviewers",
        message:
          "👀 Enter reviewers (comma-separated, or press Enter to skip):",
      },
    ]);

    // 4. Assignees 설정
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

    // 5. 라벨 선택
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

    // 6. Milestone 입력
    const { milestone } = await inquirer.prompt([
      {
        type: "input",
        name: "milestone",
        message: "📅 Enter milestone (or press Enter to skip):",
      },
    ]);

    // 7. Draft 옵션 선택
    const { isDraft } = await inquirer.prompt([
      {
        type: "confirm",
        name: "isDraft",
        message: "📝 Create as draft PR?",
        default: false,
      },
    ]);

    // 8. Base 브랜치 선택
    spinner = ora("Fetching branches...").start();
    const branches = getBranches();
    spinner.succeed(`Found ${branches.length} branch(es)`);

    const defaultBase = config.defaultBaseBranch;

    const { baseBranch } = await inquirer.prompt([
      {
        type: "list",
        name: "baseBranch",
        message: "🌿 Select base branch:",
        choices: branches.map((branch) => ({
          name: branch === defaultBase ? `${branch} (default)` : branch,
          value: branch,
        })),
        default: defaultBase,
      },
    ]);

    if (!baseBranch) {
      throw new Error("Invalid base branch selection.");
    }

    // 9. 현재 브랜치 확인
    const currentBranch = getCurrentBranch();
    console.log(chalk.gray(`\nCurrent branch: ${currentBranch}`));

    // 9-1. 브랜치 동기화 체크
    spinner = ora("Checking branch sync status...").start();
    try {
      const syncStatus = checkBranchSync(currentBranch, baseBranch);
      spinner.succeed("Branch sync checked");

      if (!syncStatus.isSynced) {
        console.log(
          chalk.yellow(
            `\n⚠️  Your branch is ${syncStatus.behind} commit(s) behind '${baseBranch}'`
          )
        );

        const { shouldSync } = await inquirer.prompt([
          {
            type: "confirm",
            name: "shouldSync",
            message: `Would you like to sync with '${baseBranch}' now? (recommended)`,
            default: true,
          },
        ]);

        if (shouldSync) {
          spinner = ora(`Syncing with '${baseBranch}'...`).start();
          try {
            syncBranch(baseBranch);
            spinner.succeed(
              chalk.green(`Branch synced successfully with '${baseBranch}'`)
            );
          } catch (error) {
            spinner.fail("Failed to sync branch");
            console.log(
              chalk.red(
                "\n⚠️  Sync failed. Please resolve conflicts manually and try again.\n"
              )
            );
            throw error;
          }
        } else {
          console.log(
            chalk.yellow(
              "\n⚠️  Proceeding without sync. Your PR may have conflicts.\n"
            )
          );
        }
      } else {
        console.log(chalk.green(`✓ Branch is up to date with '${baseBranch}'`));
      }
    } catch (error) {
      spinner.warn("Could not check branch sync (continuing anyway)");
      logger.warn("Branch sync check failed", { error: error.message });
    }

    // 10. 커밋 확인
    const commitCount = getCommitCount(baseBranch, currentBranch);
    if (commitCount === "0") {
      throw new Error(
        `No commits found between '${baseBranch}' and '${currentBranch}'. ` +
          `Please commit your changes before creating a PR.`
      );
    }

    console.log(chalk.gray(`Found ${commitCount} commit(s) to push.\n`));

    // 11. 브랜치 푸시
    spinner = ora(`Pushing branch '${currentBranch}' to remote...`).start();

    try {
      pushBranch(currentBranch);
      spinner.succeed(
        chalk.green(`Branch '${currentBranch}' pushed successfully`)
      );
    } catch (error) {
      spinner.fail("Failed to push branch");
      throw error;
    }

    // 12. PR 생성
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
        milestone,
        isDraft
      );

      spinner.succeed(chalk.green("Pull request created successfully"));

      logger.info("PR created successfully", {
        title,
        baseBranch,
        currentBranch,
        isDraft,
      });

      const draftText = isDraft ? " (draft)" : "";
      console.log(
        chalk.gray(`\n💡 Pull request created successfully${draftText}!\n`)
      );
    } catch (error) {
      spinner.fail("Failed to create pull request");
      throw error;
    }
  } catch (error) {
    if (spinner) spinner.stop();
    logger.error("PR command failed", { error: error.message });
    handleError(error, "pr command");
  }
}

module.exports = prCommand;
