const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");
const { validateGitHubCLI } = require("../utils/github");
const { validateGitRepository, executeCommand } = require("../utils/git");
const { handleError } = require("../utils/validator");
const logger = require("../utils/logger");

/**
 * 이슈 검색
 */
async function searchIssues(query, filters) {
  const args = [
    "issue",
    "list",
    "--search",
    query,
    "--json",
    "number,title,labels,author,state",
  ];

  if (filters.state && filters.state !== "all") {
    args.push("--state", filters.state);
  }

  if (filters.label) {
    args[2] = `${query} label:${filters.label}`;
  }

  if (filters.author) {
    args[2] = `${query} author:${filters.author}`;
  }

  try {
    const result = executeCommand("gh", args);
    if (!result.trim()) return [];

    const issues = JSON.parse(result);
    return issues.map((issue) => ({
      number: issue.number,
      title: issue.title,
      labels: issue.labels,
      author: issue.author ? issue.author.login : "unknown",
      state: issue.state,
    }));
  } catch (error) {
    logger.error("Failed to search issues", { error: error.message, query });
    throw new Error("❌ Failed to search issues: " + error.message);
  }
}

/**
 * PR 검색
 */
async function searchPRs(query, filters) {
  const args = [
    "pr",
    "list",
    "--search",
    query,
    "--json",
    "number,title,headRefName,author,state,isDraft",
  ];

  if (filters.state && filters.state !== "all") {
    args.push("--state", filters.state);
  }

  if (filters.author) {
    args[2] = `${query} author:${filters.author}`;
  }

  try {
    const result = executeCommand("gh", args);
    if (!result.trim()) return [];

    const prs = JSON.parse(result);
    return prs.map((pr) => ({
      number: pr.number,
      title: pr.title,
      branch: pr.headRefName,
      author: pr.author ? pr.author.login : "unknown",
      state: pr.state,
      isDraft: pr.isDraft,
    }));
  } catch (error) {
    logger.error("Failed to search PRs", { error: error.message, query });
    throw new Error("❌ Failed to search PRs: " + error.message);
  }
}

/**
 * 검색 명령어
 */
async function searchCommand() {
  const spinner = ora();

  try {
    spinner.start("Validating environment...");
    validateGitRepository();
    validateGitHubCLI();
    spinner.succeed("Environment validated");

    // 1. 검색 대상 선택
    const { searchType } = await inquirer.prompt([
      {
        type: "list",
        name: "searchType",
        message: "🔍 What would you like to search?",
        choices: [
          { name: "📋 Issues", value: "issues" },
          { name: "🔀 Pull Requests", value: "prs" },
        ],
      },
    ]);

    // 2. 검색어 입력
    const { query } = await inquirer.prompt([
      {
        type: "input",
        name: "query",
        message: "🔎 Enter search query:",
        validate: (input) => {
          return input.trim() !== "" || "Search query cannot be empty";
        },
      },
    ]);

    logger.info("Search initiated", { searchType, query });

    // 3. 필터 옵션
    const filters = {};

    // 상태 필터
    const { state } = await inquirer.prompt([
      {
        type: "list",
        name: "state",
        message: "📊 Filter by state:",
        choices: [
          { name: "All", value: "all" },
          { name: "Open", value: "open" },
          { name: "Closed", value: "closed" },
        ],
        default: "all",
      },
    ]);
    filters.state = state;

    // 작성자 필터
    const { authorFilter } = await inquirer.prompt([
      {
        type: "confirm",
        name: "authorFilter",
        message: "👤 Filter by author?",
        default: false,
      },
    ]);

    if (authorFilter) {
      const { author } = await inquirer.prompt([
        {
          type: "input",
          name: "author",
          message: "👤 Enter author username:",
        },
      ]);
      if (author.trim()) {
        filters.author = author.trim();
      }
    }

    // 이슈인 경우 라벨 필터
    if (searchType === "issues") {
      const { labelFilter } = await inquirer.prompt([
        {
          type: "confirm",
          name: "labelFilter",
          message: "🏷️  Filter by label?",
          default: false,
        },
      ]);

      if (labelFilter) {
        const { label } = await inquirer.prompt([
          {
            type: "input",
            name: "label",
            message: "🏷️  Enter label name:",
          },
        ]);
        if (label.trim()) {
          filters.label = label.trim();
        }
      }
    }

    // 4. 검색 실행
    spinner.start(`Searching ${searchType}...`);

    let results;
    if (searchType === "issues") {
      results = await searchIssues(query, filters);
    } else {
      results = await searchPRs(query, filters);
    }

    spinner.succeed(`Found ${results.length} result(s)`);

    // 5. 결과 표시
    if (!results.length) {
      console.log(chalk.yellow("\n⚠️  No results found.\n"));
      return;
    }

    console.log(
      chalk.bold.cyan(
        `\n=== 🔍 Search Results for "${query}" (${results.length}) ===\n`
      )
    );

    results.forEach((item) => {
      if (searchType === "issues") {
        const labelText =
          item.labels && item.labels.length > 0
            ? chalk.yellow(`[${item.labels.map((l) => l.name).join(", ")}]`)
            : chalk.gray("[no label]");
        const stateText =
          item.state === "OPEN" ? chalk.green("[OPEN]") : chalk.red("[CLOSED]");
        console.log(
          `${chalk.bold.white(item.number)} ${
            item.title
          } ${stateText} ${labelText} ${chalk.gray(`by @${item.author}`)}`
        );
      } else {
        const draftText = item.isDraft
          ? chalk.yellow("[DRAFT]")
          : chalk.green("[READY]");
        const stateText =
          item.state === "OPEN"
            ? chalk.green("[OPEN]")
            : chalk.magenta("[MERGED]");
        const branchText = chalk.gray(`(${item.branch})`);
        console.log(
          `${chalk.bold.white(item.number)} ${
            item.title
          } ${stateText} ${draftText} ${branchText} ${chalk.gray(
            `by @${item.author}`
          )}`
        );
      }
    });

    console.log("");

    logger.info("Search completed", {
      searchType,
      query,
      resultsCount: results.length,
    });
  } catch (error) {
    spinner.stop();
    logger.error("Search command failed", { error: error.message });
    handleError(error, "search command");
  }
}

module.exports = searchCommand;
