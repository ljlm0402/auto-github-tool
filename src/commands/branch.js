const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");
const { validateGitHubCLI, fetchOpenIssues } = require("../utils/github");
const {
  validateGitRepository,
  createBranch,
  getBranches,
  getCurrentBranch,
  deleteBranch,
} = require("../utils/git");
const {
  validateIssueNumber,
  sanitizeBranchName,
  handleError,
} = require("../utils/validator");
const { loadConfig } = require("../utils/config");
const { PROTECTED_BRANCHES } = require("../constants");
const logger = require("../utils/logger");

/**
 * Git 브랜치 생성 또는 삭제
 */
async function branchCommand() {
  const spinner = ora();

  try {
    spinner.start("Validating environment...");
    validateGitRepository();
    validateGitHubCLI();
    spinner.succeed("Environment validated");

    // 작업 선택: 생성 또는 삭제
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "🌿 What would you like to do?",
        choices: [
          { name: "➕ Create a new branch", value: "create" },
          { name: "🗑️  Delete a branch", value: "delete" },
        ],
      },
    ]);

    if (action === "create") {
      await createBranchFlow(spinner);
    } else {
      await deleteBranchFlow(spinner);
    }
  } catch (error) {
    spinner.stop();
    logger.error("Branch command failed", { error: error.message });
    handleError(error, "branch command");
  }
}

/**
 * 브랜치 생성 플로우
 */
async function createBranchFlow(spinner) {
  spinner.start("Loading configuration...");
  const config = loadConfig();
  spinner.succeed("Configuration loaded");

  // 1. 이슈 목록 조회
  spinner.start("Fetching open issues...");
  const issues = fetchOpenIssues();
  spinner.succeed(`Found ${issues.length} open issue(s)`);

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
  const { selectedIssue } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedIssue",
      message: "🔢 Select an issue to create a branch:",
      choices: issues.map((issue) => ({
        name: `#${issue.number} - ${issue.title}`,
        value: issue,
      })),
      pageSize: 10,
    },
  ]);

  logger.info("Issue selected", {
    issueNumber: selectedIssue.number,
    issueTitle: selectedIssue.title,
  });

  // 3. 브랜치 타입 선택
  const { selectedBranchType } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedBranchType",
      message: "📌 Select a branch type:",
      choices: config.branchTypes.map((branch) => ({
        name: `${branch.name} - ${branch.description}`,
        value: branch,
      })),
    },
  ]);

  logger.info("Branch type selected", {
    branchType: selectedBranchType.name,
  });

  // 4. 브랜치 이름 생성
  const sanitizedTitle = sanitizeBranchName(selectedIssue.title);
  const branchName = `${selectedBranchType.name}/${selectedIssue.number}-${sanitizedTitle}`;

  console.log(chalk.gray(`\n💡 Branch name: ${branchName}\n`));

  // 5. 브랜치 생성
  spinner.start(`Creating branch '${branchName}'...`);

  try {
    createBranch(branchName);
    spinner.succeed(
      chalk.green(`Branch '${branchName}' has been successfully created`)
    );

    logger.info("Branch created successfully", {
      branchName,
      issueNumber: selectedIssue.number,
      branchType: selectedBranchType.name,
    });

    console.log(
      chalk.gray(
        `\n💡 Tip: You can now start working on issue #${selectedIssue.number}\n`
      )
    );
  } catch (error) {
    spinner.fail("Failed to create branch");
    throw error;
  }
}

/**
 * 브랜치 삭제 플로우
 */
async function deleteBranchFlow(spinner) {
  const currentBranch = getCurrentBranch();

  spinner.start("Fetching branches...");
  const allBranches = getBranches();

  // 현재 브랜치와 보호된 브랜치 제외
  const branches = allBranches.filter(
    (branch) => branch !== currentBranch && !PROTECTED_BRANCHES.includes(branch)
  );

  spinner.succeed(`Found ${branches.length} deletable branch(es)`);

  if (!branches.length) {
    console.log(
      chalk.yellow(
        "\n⚠️  No branches available for deletion (protected branches excluded).\n"
      )
    );
    return;
  }

  // 삭제할 브랜치 선택
  const { selectedBranches } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedBranches",
      message: "🗑️  Select branches to delete:",
      choices: branches.map((branch) => ({ name: branch, value: branch })),
      pageSize: 15,
      validate: (input) => {
        return input.length > 0 || "Please select at least one branch";
      },
    },
  ]);

  // 삭제 옵션 선택
  const { deleteOptions } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "deleteOptions",
      message: "🔧 Select delete options:",
      choices: [
        { name: "Delete local branches", value: "local", checked: true },
        { name: "Delete remote branches", value: "remote" },
      ],
    },
  ]);

  if (!deleteOptions.length) {
    console.log(chalk.yellow("\n⚠️  No delete options selected.\n"));
    return;
  }

  // 확인
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: chalk.red(
        `⚠️  Are you sure you want to delete ${selectedBranches.length} branch(es)?`
      ),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.gray("\n🚫 Branch deletion cancelled.\n"));
    return;
  }

  // 브랜치 삭제 실행
  const deleteLocal = deleteOptions.includes("local");
  const deleteRemote = deleteOptions.includes("remote");

  for (const branch of selectedBranches) {
    try {
      spinner.start(`Deleting branch '${branch}'...`);
      deleteBranch(branch, deleteLocal, deleteRemote);
      spinner.succeed(chalk.green(`Branch '${branch}' deleted successfully`));

      logger.info("Branch deleted", { branch, deleteLocal, deleteRemote });
    } catch (error) {
      spinner.fail(chalk.red(`Failed to delete branch '${branch}'`));
      logger.error("Branch deletion failed", {
        branch,
        error: error.message,
      });
    }
  }

  console.log(
    chalk.gray(`\n✅ Deleted ${selectedBranches.length} branch(es)\n`)
  );
}

module.exports = branchCommand;
