const fs = require("fs");
const path = require("path");
const os = require("os");

const CONFIG_FILENAME = ".agtrc.json";

const DEFAULT_CONFIG = {
  defaultBaseBranch: "main",
  branchTypes: [
    { id: "1", name: "feature", description: "Develop new features" },
    { id: "2", name: "bugfix", description: "Fix bugs" },
    { id: "3", name: "hotfix", description: "Urgent fixes" },
    { id: "4", name: "release", description: "Prepare for a release" },
  ],
  autoAssign: true,
  defaultLabels: [],
  autoTemplates: true,
};

/**
 * 설정 유효성 검증
 */
function validateConfig(config) {
  const errors = [];

  // defaultBaseBranch 검증
  if (
    !config.defaultBaseBranch ||
    typeof config.defaultBaseBranch !== "string"
  ) {
    errors.push("defaultBaseBranch must be a non-empty string");
  }

  // branchTypes 검증
  if (!Array.isArray(config.branchTypes)) {
    errors.push("branchTypes must be an array");
  } else if (config.branchTypes.length === 0) {
    errors.push("branchTypes cannot be empty");
  } else {
    config.branchTypes.forEach((type, index) => {
      if (!type.id || !type.name || !type.description) {
        errors.push(
          `branchTypes[${index}] must have id, name, and description fields`
        );
      }
      if (typeof type.name !== "string" || !/^[a-z]+$/.test(type.name)) {
        errors.push(
          `branchTypes[${index}].name must contain only lowercase letters`
        );
      }
    });
  }

  // autoAssign 검증
  if (typeof config.autoAssign !== "boolean") {
    errors.push("autoAssign must be a boolean");
  }

  // defaultLabels 검증
  if (!Array.isArray(config.defaultLabels)) {
    errors.push("defaultLabels must be an array");
  }

  // autoTemplates 검증
  if (typeof config.autoTemplates !== "boolean") {
    errors.push("autoTemplates must be a boolean");
  }

  if (errors.length > 0) {
    throw new Error(
      `❌ Invalid configuration:\n${errors.map((e) => `  - ${e}`).join("\n")}`
    );
  }

  return true;
}

/**
 * 설정 파일 경로 가져오기 (프로젝트 > 홈 디렉토리)
 */
function getConfigPath() {
  // 1. 현재 디렉토리에서 찾기
  const localPath = path.join(process.cwd(), CONFIG_FILENAME);
  if (fs.existsSync(localPath)) {
    return localPath;
  }

  // 2. 홈 디렉토리에서 찾기
  const homePath = path.join(os.homedir(), CONFIG_FILENAME);
  return homePath;
}

/**
 * 설정 파일 로드
 */
function loadConfig() {
  const configPath = getConfigPath();

  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(configData);
      const mergedConfig = { ...DEFAULT_CONFIG, ...config };

      // 설정 검증
      validateConfig(mergedConfig);

      return mergedConfig;
    }
  } catch (error) {
    if (error.message.includes("Invalid configuration")) {
      console.error(error.message);
      console.warn(`\n⚠️  Using default configuration instead.\n`);
    } else {
      console.warn(
        `⚠️  Failed to load config from ${configPath}, using defaults.`
      );
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * 설정 파일 저장
 */
function saveConfig(config, global = false) {
  const configPath = global
    ? path.join(os.homedir(), CONFIG_FILENAME)
    : path.join(process.cwd(), CONFIG_FILENAME);

  try {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    fs.writeFileSync(
      configPath,
      JSON.stringify(mergedConfig, null, 2),
      "utf-8"
    );
    console.log(`✅ Configuration saved to ${configPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to save config: ${error.message}`);
    return false;
  }
}

/**
 * 설정 초기화 (대화형)
 */
async function initConfig(global = false) {
  const inquirer = require("inquirer");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "defaultBaseBranch",
      message: "Default base branch:",
      default: DEFAULT_CONFIG.defaultBaseBranch,
    },
    {
      type: "confirm",
      name: "autoAssign",
      message: "Automatically assign yourself to issues/PRs?",
      default: DEFAULT_CONFIG.autoAssign,
    },
    {
      type: "confirm",
      name: "autoTemplates",
      message: "Automatically use templates when available?",
      default: DEFAULT_CONFIG.autoTemplates,
    },
  ]);

  return saveConfig(answers, global);
}

module.exports = {
  loadConfig,
  saveConfig,
  initConfig,
  validateConfig,
  DEFAULT_CONFIG,
};
