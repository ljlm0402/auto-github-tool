const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");
const { validateGitHubCLI, createLabel } = require("../utils/github");
const { validateGitRepository } = require("../utils/git");
const {
  validateNotEmpty,
  validateHexColor,
  handleError,
} = require("../utils/validator");
const logger = require("../utils/logger");

/**
 * GitHub 라벨 생성
 */
async function labelCommand() {
  const spinner = ora();

  try {
    spinner.start("Validating environment...");
    validateGitRepository();
    validateGitHubCLI();
    spinner.succeed("Environment validated");

    // 1. 라벨 정보 입력
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "labelName",
        message: "🏷 Enter label name:",
        validate: (input) => {
          return input.trim() !== "" || "Label name cannot be empty";
        },
      },
      {
        type: "input",
        name: "labelColor",
        message: "🎨 Enter label color (6-digit hex, e.g., FFFFFF):",
        default: "FFFFFF",
        validate: (input) => {
          try {
            validateHexColor(input);
            return true;
          } catch (error) {
            return error.message;
          }
        },
      },
      {
        type: "input",
        name: "labelDescription",
        message: "📝 Enter label description (optional):",
      },
    ]);

    const { labelName, labelColor, labelDescription } = answers;
    const validatedColor = validateHexColor(labelColor);

    logger.info("Creating label", {
      name: labelName,
      color: validatedColor,
      description: labelDescription,
    });

    // 2. 라벨 생성
    spinner.start(`Creating label '${labelName}'...`);

    try {
      const result = createLabel(labelName, validatedColor, labelDescription);
      spinner.succeed(
        chalk.green(`Label '${labelName}' has been successfully created`)
      );

      logger.info("Label created successfully", { name: labelName });

      console.log(chalk.gray(`\n💡 Color: #${validatedColor}`));
      if (labelDescription) {
        console.log(chalk.gray(`💡 Description: ${labelDescription}`));
      }
      console.log("");
    } catch (error) {
      spinner.fail("Failed to create label");
      throw error;
    }
  } catch (error) {
    spinner.stop();
    logger.error("Label command failed", { error: error.message });
    handleError(error, "label command");
  }
}

module.exports = labelCommand;
