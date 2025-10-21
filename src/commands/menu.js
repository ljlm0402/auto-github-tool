const inquirer = require("inquirer");
const chalk = require("chalk");
const listCommand = require("./list");
const issueCommand = require("./issue");
const branchCommand = require("./branch");
const prCommand = require("./pr");
const labelCommand = require("./label");
const { initConfig } = require("../utils/config");

/**
 * 메인 메뉴 표시
 */
async function showMainMenu() {
  console.log(chalk.bold.cyan("\n╔════════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("║   🤖 Auto GitHub Tool - Main Menu    ║"));
  console.log(chalk.bold.cyan("╚════════════════════════════════════════╝\n"));

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        {
          name: "📋 List open issues",
          value: "list",
        },
        {
          name: "➕ Create a new issue",
          value: "issue",
        },
        {
          name: "🌿 Create a branch from an issue",
          value: "branch",
        },
        {
          name: "🔀 Create a pull request",
          value: "pr",
        },
        {
          name: "🏷️  Create a new label",
          value: "label",
        },
        new inquirer.Separator(),
        {
          name: "⚙️  Configure AGT settings",
          value: "config",
        },
        {
          name: "❓ Show help",
          value: "help",
        },
        new inquirer.Separator(),
        {
          name: "🚪 Exit",
          value: "exit",
        },
      ],
      pageSize: 15,
    },
  ]);

  return action;
}

/**
 * 설정 메뉴
 */
async function showConfigMenu() {
  const { configAction } = await inquirer.prompt([
    {
      type: "list",
      name: "configAction",
      message: "Configuration options:",
      choices: [
        {
          name: "📝 Initialize local config (.agtrc.json)",
          value: "init-local",
        },
        {
          name: "🌍 Initialize global config (~/.agtrc.json)",
          value: "init-global",
        },
        {
          name: "🔙 Back to main menu",
          value: "back",
        },
      ],
    },
  ]);

  switch (configAction) {
    case "init-local":
      await initConfig(false);
      break;
    case "init-global":
      await initConfig(true);
      break;
    case "back":
      return;
  }
}

/**
 * 도움말 표시
 */
function showHelp() {
  console.log(chalk.bold.cyan("\n╔════════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("║        AGT Command Reference          ║"));
  console.log(chalk.bold.cyan("╚════════════════════════════════════════╝\n"));

  console.log(chalk.bold("Usage:"));
  console.log(chalk.gray("  agt [command]\n"));

  console.log(chalk.bold("Commands:"));
  console.log("  " + chalk.cyan("(no command)") + "    Start interactive menu");
  console.log("  " + chalk.cyan("help") + "            Show this help message");
  console.log("  " + chalk.cyan("list") + "            Show open issues");
  console.log("  " + chalk.cyan("issue") + "           Create a new issue");
  console.log(
    "  " + chalk.cyan("branch") + "          Create a branch from an issue"
  );
  console.log("  " + chalk.cyan("pr") + "              Create a pull request");
  console.log("  " + chalk.cyan("label") + "           Create a new label");
  console.log(
    "  " + chalk.cyan("config") + "          Configure AGT settings\n"
  );

  console.log(chalk.bold("Configuration Files:"));
  console.log(
    "  " + chalk.gray(".agtrc.json") + "     Project-specific settings"
  );
  console.log("  " + chalk.gray("~/.agtrc.json") + "   User-wide settings\n");

  console.log(chalk.bold("Quick Start:"));
  console.log(
    chalk.gray("  $ agt              ") +
      "  # Interactive mode (recommended for beginners)"
  );
  console.log(chalk.gray("  $ agt list         ") + "  # View open issues");
  console.log(
    chalk.gray("  $ agt config       ") + "  # Initialize configuration\n"
  );
}

/**
 * 계속 여부 확인
 */
async function askToContinue() {
  const { continue: shouldContinue } = await inquirer.prompt([
    {
      type: "confirm",
      name: "continue",
      message: "Would you like to do something else?",
      default: true,
    },
  ]);

  return shouldContinue;
}

/**
 * 대화형 메뉴 모드 실행
 */
async function interactiveMode() {
  let shouldContinue = true;

  while (shouldContinue) {
    const action = await showMainMenu();

    switch (action) {
      case "list":
        await listCommand();
        break;
      case "issue":
        await issueCommand();
        break;
      case "branch":
        await branchCommand();
        break;
      case "pr":
        await prCommand();
        break;
      case "label":
        await labelCommand();
        break;
      case "config":
        await showConfigMenu();
        break;
      case "help":
        showHelp();
        break;
      case "exit":
        console.log(chalk.green("\n👋 Thanks for using AGT! Goodbye!\n"));
        shouldContinue = false;
        continue;
    }

    if (shouldContinue && action !== "help" && action !== "config") {
      shouldContinue = await askToContinue();
    }
  }
}

module.exports = {
  interactiveMode,
  showHelp,
};
