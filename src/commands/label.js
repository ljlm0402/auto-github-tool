const readlineSync = require("readline-sync");
const chalk = require("chalk");
const ora = require("ora");
const { validateGitHubCLI, createLabel } = require("../utils/github");
const { validateGitRepository } = require("../utils/git");
const {
  validateNotEmpty,
  validateHexColor,
  handleError,
} = require("../utils/validator");

/**
 * GitHub 라벨 생성
 */
async function labelCommand() {
  try {
    validateGitRepository();
    validateGitHubCLI();

    // 1. 라벨 이름 입력
    console.log("");
    const labelName = validateNotEmpty(
      readlineSync.question(chalk.cyan("🏷 Enter label name: ")),
      "Label name"
    );

    // 2. 색상 입력
    const colorInput = readlineSync.question(
      chalk.cyan(
        "🎨 Enter label color (6-digit hex, e.g., FFFFFF) [default: FFFFFF]: "
      )
    );
    const labelColor = validateHexColor(colorInput);

    // 3. 설명 입력
    const labelDescription = readlineSync.question(
      chalk.cyan("📝 Enter label description (optional): ")
    );

    // 4. 라벨 생성
    const spinner = ora(`Creating label '${labelName}'...`).start();

    try {
      const result = createLabel(labelName, labelColor, labelDescription);
      spinner.succeed(
        chalk.green(`✅ Label '${labelName}' has been successfully created.`)
      );
      console.log(result);
      console.log("");
    } catch (error) {
      spinner.fail("Failed to create label");
      throw error;
    }
  } catch (error) {
    handleError(error, "label command");
  }
}

module.exports = labelCommand;
