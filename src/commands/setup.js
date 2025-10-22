const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");
const { spawnSync } = require("child_process");
const { initConfig } = require("../utils/config");
const logger = require("../utils/logger");

/**
 * Setup wizard main function
 */
async function setupCommand() {
  console.log(
    chalk.bold.cyan("\n╔════════════════════════════════════════════════╗")
  );
  console.log(
    chalk.bold.cyan("║    🎉 Welcome to Auto GitHub Tool Setup!     ║")
  );
  console.log(
    chalk.bold.cyan("╚════════════════════════════════════════════════╝\n")
  );

  console.log(chalk.gray("This wizard will help you get started with AGT.\n"));
  console.log(
    chalk.gray("We'll check your environment and configure AGT for you.\n")
  );

  const { proceed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message: "Ready to begin setup?",
      default: true,
    },
  ]);

  if (!proceed) {
    console.log(
      chalk.yellow("\n👋 Setup cancelled. Run 'agt setup' when you're ready!\n")
    );
    return;
  }

  // Run setup steps
  const results = {
    git: false,
    gh: false,
    auth: false,
    connection: false,
    config: false,
  };

  // Step 1: Check Git
  results.git = await checkGit();

  // Step 2: Check GitHub CLI
  if (results.git) {
    results.gh = await checkGitHubCLI();
  }

  // Step 3: Check Authentication
  if (results.gh) {
    results.auth = await checkAuthentication();
  }

  // Step 4: Test Connection
  if (results.auth) {
    results.connection = await testConnection();
  }

  // Step 5: Create Config (optional - can be skipped)
  if (results.connection) {
    results.config = await createConfiguration();
  }

  // Display summary
  displaySummary(results);
}

/**
 * Step 1: Check Git installation
 */
async function checkGit() {
  console.log(chalk.bold("\n📦 Step 1/5: Checking Git installation...\n"));

  const spinner = ora("Checking for Git...").start();

  try {
    const result = spawnSync("git", ["--version"], { encoding: "utf-8" });

    if (result.status === 0) {
      const version = result.stdout.trim();
      spinner.succeed(chalk.green(`Git found: ${version}`));
      logger.info("Git check passed", { version });
      return true;
    } else {
      throw new Error("Git not found");
    }
  } catch (error) {
    spinner.fail(chalk.red("Git is not installed"));
    console.log(chalk.yellow("\n💡 How to install Git:"));
    console.log(chalk.gray("   • macOS:   brew install git"));
    console.log(chalk.gray("   • Ubuntu:  sudo apt-get install git"));
    console.log(chalk.gray("   • Windows: https://git-scm.com/downloads\n"));
    console.log(
      chalk.gray(
        "📚 Documentation: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git\n"
      )
    );

    logger.error("Git check failed");
    return false;
  }
}

/**
 * Step 2: Check GitHub CLI installation
 */
async function checkGitHubCLI() {
  console.log(
    chalk.bold("\n📦 Step 2/5: Checking GitHub CLI installation...\n")
  );

  const spinner = ora("Checking for GitHub CLI...").start();

  try {
    const result = spawnSync("gh", ["--version"], { encoding: "utf-8" });

    if (result.status === 0) {
      const version = result.stdout.split("\n")[0].trim();
      spinner.succeed(chalk.green(`GitHub CLI found: ${version}`));
      logger.info("GitHub CLI check passed", { version });
      return true;
    } else {
      throw new Error("GitHub CLI not found");
    }
  } catch (error) {
    spinner.fail(chalk.red("GitHub CLI is not installed"));
    console.log(chalk.yellow("\n💡 How to install GitHub CLI:"));
    console.log(chalk.gray("   • macOS:   brew install gh"));
    console.log(chalk.gray("   • Ubuntu:  sudo apt install gh"));
    console.log(chalk.gray("   • Windows: winget install GitHub.cli"));
    console.log(chalk.gray("   • Manual:  https://cli.github.com/\n"));
    console.log(
      chalk.gray(
        "📚 Documentation: https://cli.github.com/manual/installation\n"
      )
    );

    const { installNow } = await inquirer.prompt([
      {
        type: "confirm",
        name: "installNow",
        message:
          "Would you like to open the installation page in your browser?",
        default: true,
      },
    ]);

    if (installNow) {
      console.log(chalk.gray("\n🌐 Opening https://cli.github.com/ ...\n"));
      const openCommand =
        process.platform === "darwin"
          ? "open"
          : process.platform === "win32"
          ? "start"
          : "xdg-open";
      spawnSync(openCommand, ["https://cli.github.com/"]);
    }

    logger.error("GitHub CLI check failed");
    return false;
  }
}

/**
 * Step 3: Check GitHub authentication
 */
async function checkAuthentication() {
  console.log(chalk.bold("\n🔐 Step 3/5: Checking GitHub authentication...\n"));

  const spinner = ora("Checking authentication status...").start();

  try {
    const result = spawnSync("gh", ["auth", "status"], { encoding: "utf-8" });

    if (result.status === 0) {
      // Parse username from output
      const output = result.stdout + result.stderr;
      const match = output.match(/Logged in to github\.com as ([^\s]+)/);
      const username = match ? match[1] : "unknown";

      spinner.succeed(chalk.green(`Authenticated as: ${username}`));
      logger.info("Authentication check passed", { username });
      return true;
    } else {
      throw new Error("Not authenticated");
    }
  } catch (error) {
    spinner.fail(chalk.red("Not authenticated with GitHub"));
    console.log(
      chalk.yellow("\n💡 You need to authenticate with GitHub CLI\n")
    );

    const { authenticate } = await inquirer.prompt([
      {
        type: "confirm",
        name: "authenticate",
        message: "Would you like to authenticate now?",
        default: true,
      },
    ]);

    if (authenticate) {
      console.log(chalk.cyan("\n🚀 Starting GitHub CLI authentication...\n"));
      console.log(chalk.gray("Follow the prompts in your terminal:\n"));

      const authResult = spawnSync("gh", ["auth", "login"], {
        stdio: "inherit",
        encoding: "utf-8",
      });

      if (authResult.status === 0) {
        console.log(chalk.green("\n✅ Authentication successful!\n"));
        logger.info("Authentication completed");
        return true;
      } else {
        console.log(chalk.red("\n❌ Authentication failed\n"));
        logger.error("Authentication failed");
        return false;
      }
    } else {
      console.log(
        chalk.yellow("\n⚠️  You can authenticate later with: gh auth login\n")
      );
      logger.warn("Authentication skipped by user");
      return false;
    }
  }
}

/**
 * Step 4: Create Configuration (optional - can be skipped)
 */
async function createConfiguration() {
  console.log(chalk.bold.cyan("\n⚙️  Step 5: AGT Configuration (Optional)"));
  console.log(chalk.gray("Create a configuration file for AGT settings\n"));

  const { configType } = await inquirer.prompt([
    {
      type: "list",
      name: "configType",
      message: "Where would you like to store your configuration?",
      choices: [
        {
          name: "📁 Local (current project only) - ./.agtrc.json",
          value: "local",
        },
        {
          name: "🌍 Global (all projects) - ~/.agtrc.json",
          value: "global",
        },
        {
          name: "⏭️  Skip for now",
          value: "skip",
        },
      ],
    },
  ]);

  if (configType === "skip") {
    console.log(chalk.yellow("\n⚠️  Configuration skipped"));
    console.log(chalk.gray("You can create it later with: agt config\n"));
    logger.warn("Configuration creation skipped");
    return "skipped";
  }

  const spinner = ora("Creating configuration...").start();

  try {
    const isGlobal = configType === "global";
    await initConfig(isGlobal);
    spinner.succeed(
      chalk.green(
        `Configuration created: ${isGlobal ? "~/.agtrc.json" : "./.agtrc.json"}`
      )
    );
    logger.info("Configuration created", { type: configType });
    return true;
  } catch (error) {
    spinner.fail(chalk.red("Failed to create configuration"));
    console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
    logger.error("Configuration creation failed", { error: error.message });
    return false;
  }
}

/**
 * Step 5: Test Connection
 */
async function testConnection() {
  console.log(chalk.bold.cyan("\n� Step 4: Testing GitHub Connection"));
  console.log(chalk.gray("Verifying access to GitHub API...\n"));

  const spinner = ora("Connecting to GitHub...").start();

  try {
    // Test 1: Get current user
    const userResult = spawnSync("gh", ["api", "user", "-q", ".login"], {
      encoding: "utf-8",
    });

    if (userResult.status !== 0) {
      throw new Error("Failed to fetch user info");
    }

    const username = userResult.stdout.trim();

    // Test 2: Check if we're in a git repo (optional)
    let repoName = "N/A";
    try {
      const repoResult = spawnSync(
        "gh",
        ["repo", "view", "--json", "name", "-q", ".name"],
        {
          encoding: "utf-8",
        }
      );
      if (repoResult.status === 0) {
        repoName = repoResult.stdout.trim();
      }
    } catch {
      // Not in a repo, that's OK
    }

    spinner.succeed(chalk.green("Connection test passed!"));

    console.log(chalk.cyan("\n┌─────────────────────────────────────┐"));
    console.log(chalk.cyan("│     Connection Test Results        │"));
    console.log(chalk.cyan("├─────────────────────────────────────┤"));
    console.log(chalk.cyan(`│ GitHub User:  ${username.padEnd(20)} │`));
    console.log(chalk.cyan(`│ Repository:   ${repoName.padEnd(20)} │`));
    console.log(chalk.cyan("└─────────────────────────────────────┘\n"));

    logger.info("Connection test passed", { username, repo: repoName });
    return true;
  } catch (error) {
    spinner.fail(chalk.red("Connection test failed"));
    console.log(chalk.yellow("\n⚠️  Could not connect to GitHub"));
    console.log(
      chalk.gray("Please check your internet connection and authentication\n")
    );
    logger.error("Connection test failed", { error: error.message });
    return false;
  }
}

/**
 * Display setup summary
 */
function displaySummary(results) {
  console.log(
    chalk.bold.cyan("\n╔════════════════════════════════════════════════╗")
  );
  console.log(
    chalk.bold.cyan("║            Setup Summary                      ║")
  );
  console.log(
    chalk.bold.cyan("╚════════════════════════════════════════════════╝\n")
  );

  const status = (passed) =>
    passed ? chalk.green("✅ PASS") : chalk.red("❌ FAIL");

  const configStatus =
    results.config === "skipped"
      ? chalk.yellow("⏭️  SKIP")
      : status(results.config);

  console.log(`${status(results.git)}  Git installation`);
  console.log(`${status(results.gh)}  GitHub CLI installation`);
  console.log(`${status(results.auth)}  GitHub authentication`);
  console.log(`${status(results.connection)}  GitHub connection`);
  console.log(`${configStatus}  AGT configuration\n`);

  const allPassed =
    results.git && results.gh && results.auth && results.connection;
  // Config is optional, so we don't check it for "all passed"

  if (allPassed) {
    console.log(chalk.green.bold("🎉 Setup completed successfully!\n"));
    console.log(chalk.cyan("You're ready to use Auto GitHub Tool!\n"));
    console.log(chalk.bold("Quick Start:"));
    console.log(chalk.gray("  • Run 'agt' to start interactive mode"));
    console.log(chalk.gray("  • Run 'agt help' to see all commands"));
    console.log(chalk.gray("  • Run 'agt list' to view open issues\n"));
    logger.info("Setup completed successfully");
  } else {
    console.log(chalk.yellow.bold("⚠️  Setup incomplete\n"));
    console.log(
      chalk.yellow(
        "Some steps failed. Please resolve the issues above and run:"
      )
    );
    console.log(chalk.cyan("  agt setup\n"));
    console.log(chalk.gray("Or manually install missing components.\n"));
    logger.warn("Setup completed with failures", { results });
  }

  console.log(
    chalk.gray("💡 Tip: You can re-run this setup anytime with: agt setup\n")
  );
}

module.exports = setupCommand;
