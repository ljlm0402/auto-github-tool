#!/usr/bin/env node

/*****************************************************************
 * Auto GitHub Tool (AGT) - Automate GitHub workflows
 * (c) 2025-present AGUMON (https://github.com/ljlm0402/auto-github-tool)
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the project root for more information.
 *
 * Made with ❤️ by AGUMON 🦖
 *****************************************************************/

const listCommand = require("../src/commands/list");
const issueCommand = require("../src/commands/issue");
const branchCommand = require("../src/commands/branch");
const prCommand = require("../src/commands/pr");
const labelCommand = require("../src/commands/label");
const searchCommand = require("../src/commands/search");
const statsCommand = require("../src/commands/stats");
const setupCommand = require("../src/commands/setup");
const { interactiveMode, showHelp } = require("../src/commands/menu");
const { initConfig } = require("../src/utils/config");

// 명령어 매핑
const commands = {
  help: showHelp,
  list: listCommand,
  search: searchCommand,
  stats: statsCommand,
  setup: setupCommand,
  issue: issueCommand,
  branch: branchCommand,
  pr: prCommand,
  label: labelCommand,
  config: async () => {
    const args = process.argv.slice(3);
    const isGlobal = args.includes("--global") || args.includes("-g");
    await initConfig(isGlobal);
  },
};

async function main() {
  const command = process.argv[2];

  // 명령어가 없으면 대화형 모드 실행
  if (!command) {
    await interactiveMode();
    process.exit(0);
  }

  // 명령어 실행
  const commandFunction = commands[command];

  if (commandFunction) {
    await commandFunction();
    process.exit(0);
  } else {
    console.log(`❌ Unknown command: '${command}'`);
    console.log(
      "💡 Use 'agt help' to see available commands or run 'agt' for interactive mode.\n"
    );
    process.exit(1);
  }
}

// 실행
main().catch((error) => {
  console.error("\n❌ Unexpected error:", error.message);
  process.exit(1);
});
