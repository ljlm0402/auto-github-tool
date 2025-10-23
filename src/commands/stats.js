const chalk = require("chalk");
const ora = require("ora");
const { validateGitHubCLI } = require("../utils/github");
const { validateGitRepository, executeCommand } = require("../utils/git");
const { handleError } = require("../utils/validator");
const logger = require("../utils/logger");

/**
 * GitHub API로 저장소 통계 가져오기
 */
async function fetchRepoStats() {
  try {
    const repoInfo = executeCommand("gh", [
      "api",
      "repos/:owner/:repo",
      "-q",
      "{name, description, stargazers_count, forks_count, open_issues_count, watchers_count, created_at, updated_at}",
    ]);
    return JSON.parse(repoInfo);
  } catch (error) {
    logger.error("Failed to fetch repo stats", { error: error.message });
    throw new Error("❌ Failed to fetch repository statistics");
  }
}

/**
 * 이슈 통계 가져오기
 */
async function fetchIssueStats() {
  try {
    const issues = executeCommand("gh", [
      "api",
      "repos/:owner/:repo/issues?state=all&per_page=100",
      "-q",
      ".[] | {number, state, labels: .labels[].name, author: .user.login, created_at}",
    ]);

    if (!issues.trim()) {
      return { total: 0, open: 0, closed: 0, byLabel: {}, byAuthor: {} };
    }

    const issueList = issues
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((issue) => issue !== null);

    const stats = {
      total: issueList.length,
      open: issueList.filter((i) => i.state === "open").length,
      closed: issueList.filter((i) => i.state === "closed").length,
      byLabel: {},
      byAuthor: {},
    };

    // 라벨별 집계
    issueList.forEach((issue) => {
      if (issue.labels) {
        const labels = Array.isArray(issue.labels)
          ? issue.labels
          : [issue.labels];
        labels.forEach((label) => {
          if (label) {
            stats.byLabel[label] = (stats.byLabel[label] || 0) + 1;
          }
        });
      }

      // 작성자별 집계
      if (issue.author) {
        stats.byAuthor[issue.author] = (stats.byAuthor[issue.author] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    logger.error("Failed to fetch issue stats", { error: error.message });
    return { total: 0, open: 0, closed: 0, byLabel: {}, byAuthor: {} };
  }
}

/**
 * PR 통계 가져오기
 */
async function fetchPRStats() {
  try {
    const prs = executeCommand("gh", [
      "api",
      "repos/:owner/:repo/pulls?state=all&per_page=100",
      "-q",
      ".[] | {number, state, draft: .draft, author: .user.login, created_at}",
    ]);

    if (!prs.trim()) {
      return {
        total: 0,
        open: 0,
        closed: 0,
        merged: 0,
        draft: 0,
        byAuthor: {},
      };
    }

    const prList = prs
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((pr) => pr !== null);

    const stats = {
      total: prList.length,
      open: prList.filter((pr) => pr.state === "open").length,
      closed: prList.filter((pr) => pr.state === "closed").length,
      merged: 0, // GitHub API로는 merged 상태를 직접 가져오기 어려움
      draft: prList.filter((pr) => pr.draft).length,
      byAuthor: {},
    };

    // 작성자별 집계
    prList.forEach((pr) => {
      if (pr.author) {
        stats.byAuthor[pr.author] = (stats.byAuthor[pr.author] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    logger.error("Failed to fetch PR stats", { error: error.message });
    return { total: 0, open: 0, closed: 0, merged: 0, draft: 0, byAuthor: {} };
  }
}

/**
 * 기여자 통계 가져오기
 */
async function fetchContributorStats() {
  try {
    const contributors = executeCommand("gh", [
      "api",
      "repos/:owner/:repo/contributors?per_page=10",
      "-q",
      ".[] | {login: .login, contributions: .contributions}",
    ]);

    if (!contributors.trim()) {
      return [];
    }

    return contributors
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((c) => c !== null);
  } catch (error) {
    logger.error("Failed to fetch contributor stats", { error: error.message });
    return [];
  }
}

/**
 * 진행률 바 생성
 */
function createProgressBar(value, total, width = 30) {
  if (total === 0) return "░".repeat(width) + " 0%";

  const percentage = Math.round((value / total) * 100);
  const filledWidth = Math.round((value / total) * width);
  const emptyWidth = width - filledWidth;

  const filled = "█".repeat(filledWidth);
  const empty = "░".repeat(emptyWidth);

  return `${filled}${empty} ${percentage}%`;
}

/**
 * 박스 그리기 헬퍼
 */
function drawBox(title, width = 50) {
  const padding = Math.max(0, width - title.length - 2);
  const leftPad = Math.floor(padding / 2);
  const rightPad = Math.ceil(padding / 2);

  console.log(chalk.cyan("┌" + "─".repeat(width) + "┐"));
  console.log(
    chalk.cyan("│") +
      " ".repeat(leftPad) +
      chalk.bold.white(title) +
      " ".repeat(rightPad) +
      chalk.cyan("│")
  );
  console.log(chalk.cyan("└" + "─".repeat(width) + "┘"));
}

/**
 * 섹션 헤더
 */
function drawSectionHeader(icon, title) {
  console.log("\n" + chalk.bold.cyan("━".repeat(52)));
  console.log(chalk.bold.yellow(`  ${icon}  ${title}`));
  console.log(chalk.cyan("━".repeat(52)));
}

/**
 * 테이블 행 그리기
 */
function drawTableRow(label, value, maxWidth = 40) {
  const dots = ".".repeat(
    Math.max(2, maxWidth - label.length - String(value).length)
  );
  console.log(
    `  ${chalk.gray(label)} ${chalk.dim(dots)} ${chalk.white(value)}`
  );
}

/**
 * 상위 N개 항목 표시 (개선된 버전)
 */
function displayTopItems(items, icon, title, limit = 5) {
  const sorted = Object.entries(items)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);

  if (sorted.length === 0) {
    console.log(chalk.dim(`  No ${title.toLowerCase()} data available`));
    return;
  }

  console.log(chalk.bold.cyan(`\n  ${icon} ${title}`));
  console.log(chalk.dim("  " + "─".repeat(48)));

  const maxCount = sorted[0][1];
  sorted.forEach(([name, count], index) => {
    const medal =
      index === 0
        ? chalk.yellow("🥇")
        : index === 1
        ? chalk.gray("🥈")
        : index === 2
        ? chalk.yellow("🥉")
        : chalk.dim("  ");

    const percentage = Math.round((count / maxCount) * 100);
    const barWidth = Math.floor(percentage / 5); // 20 chars max
    const bar =
      chalk.cyan("█".repeat(barWidth)) + chalk.dim("░".repeat(20 - barWidth));

    const nameDisplay = name.length > 20 ? name.substring(0, 17) + "..." : name;
    const namePadded = nameDisplay.padEnd(20);

    console.log(
      `  ${medal} ${chalk.white(namePadded)} ${bar} ${chalk.yellow(
        count.toString().padStart(4)
      )}`
    );
  });
}

/**
 * 통계 대시보드 표시
 */
async function statsCommand() {
  const spinner = ora();

  try {
    spinner.start("Validating environment...");
    validateGitRepository();
    validateGitHubCLI();
    spinner.succeed("Environment validated");

    console.log("");
    drawBox("📊  REPOSITORY STATISTICS DASHBOARD  📊", 50);

    // Fetch all statistics in parallel for better performance
    spinner.start("Fetching all statistics...");

    const [repoStats, issueStats, prStats, contributors] = await Promise.all([
      fetchRepoStats(),
      fetchIssueStats(),
      fetchPRStats(),
      fetchContributorStats(),
    ]).catch((error) => {
      spinner.fail("Failed to fetch statistics");
      throw error;
    });

    spinner.succeed("All statistics loaded");

    // 1. 저장소 기본 정보
    drawSectionHeader("📦", "Repository Overview");
    console.log("");
    drawTableRow("Repository Name", chalk.cyan.bold(repoStats.name));
    if (repoStats.description) {
      const desc =
        repoStats.description.length > 45
          ? repoStats.description.substring(0, 42) + "..."
          : repoStats.description;
      console.log(chalk.dim(`  📝 ${desc}`));
      console.log("");
    }
    drawTableRow("⭐ Stars", chalk.yellow.bold(repoStats.stargazers_count));
    drawTableRow("🔀 Forks", chalk.cyan.bold(repoStats.forks_count));
    drawTableRow("👀 Watchers", chalk.blue.bold(repoStats.watchers_count));
    drawTableRow("🐛 Open Issues", chalk.red.bold(repoStats.open_issues_count));

    // 2. 이슈 통계
    drawSectionHeader("📋", "Issue Statistics");
    console.log("");

    drawTableRow("Total Issues", chalk.white.bold(issueStats.total));
    console.log("");

    if (issueStats.total > 0) {
      const openBar = createProgressBar(issueStats.open, issueStats.total, 25);
      const closedBar = createProgressBar(
        issueStats.closed,
        issueStats.total,
        25
      );

      console.log(
        `  ${chalk.green("●")} ${chalk.green("Open Issues")} ${chalk.dim(
          "·"
        )} ${chalk.white.bold(issueStats.open)}`
      );
      console.log(`    ${chalk.dim(openBar)}`);
      console.log(
        `  ${chalk.red("●")} ${chalk.red("Closed Issues")} ${chalk.dim(
          "·"
        )} ${chalk.white.bold(issueStats.closed)}`
      );
      console.log(`    ${chalk.dim(closedBar)}`);
    }

    // 라벨별 이슈
    if (Object.keys(issueStats.byLabel).length > 0) {
      displayTopItems(issueStats.byLabel, "🏷️", "Labels by Issue Count");
    }

    // 작성자별 이슈
    if (Object.keys(issueStats.byAuthor).length > 0) {
      displayTopItems(issueStats.byAuthor, "✍️", "Most Active Issue Authors");
    }

    // 3. PR 통계
    drawSectionHeader("🔀", "Pull Request Statistics");
    console.log("");

    drawTableRow("Total Pull Requests", chalk.white.bold(prStats.total));

    if (prStats.total > 0) {
      console.log("");
      drawTableRow("  ◆ Open PRs", chalk.green.bold(prStats.open));
      drawTableRow("  ◆ Closed PRs", chalk.red.bold(prStats.closed));
      drawTableRow("  ◆ Draft PRs", chalk.yellow.bold(prStats.draft));
    }

    // 작성자별 PR
    if (Object.keys(prStats.byAuthor).length > 0) {
      displayTopItems(prStats.byAuthor, "💻", "Most Active PR Authors");
    }

    // 4. 기여자 통계
    if (contributors.length > 0) {
      drawSectionHeader("👥", "Top Contributors");
      console.log(chalk.dim("  " + "─".repeat(48)));

      const maxContributions = contributors[0].contributions;
      contributors.slice(0, 10).forEach((contributor, index) => {
        const medal =
          index === 0
            ? chalk.yellow("🥇")
            : index === 1
            ? chalk.gray("🥈")
            : index === 2
            ? chalk.yellow("🥉")
            : chalk.dim(`${(index + 1).toString().padStart(2)}.`);

        const percentage = Math.round(
          (contributor.contributions / maxContributions) * 100
        );
        const barWidth = Math.floor(percentage / 5); // 20 chars max
        const bar =
          chalk.green("█".repeat(barWidth)) +
          chalk.dim("░".repeat(20 - barWidth));

        const name =
          contributor.login.length > 16
            ? contributor.login.substring(0, 13) + "..."
            : contributor.login;
        const namePadded = name.padEnd(16);

        const commits = contributor.contributions.toString().padStart(4);

        console.log(
          `  ${medal} ${chalk.white(namePadded)} ${bar} ${chalk.yellow(
            commits
          )} commits`
        );
      });
    }

    // 5. 요약
    drawSectionHeader("📈", "Summary");
    console.log("");

    const issueCloseRate =
      issueStats.total > 0
        ? Math.round((issueStats.closed / issueStats.total) * 100)
        : 0;

    const closeRateColor =
      issueCloseRate >= 80
        ? chalk.green
        : issueCloseRate >= 50
        ? chalk.yellow
        : chalk.red;

    drawTableRow("Issue Close Rate", closeRateColor(issueCloseRate + "%"));
    drawTableRow("Total Contributors", chalk.cyan(contributors.length));
    drawTableRow(
      "Total Activity",
      chalk.magenta(`${issueStats.total + prStats.total} (Issues + PRs)`)
    );

    const healthScore = Math.round(
      (issueCloseRate / 100) * 40 +
        (Math.min(contributors.length, 20) / 20) * 30 +
        (Math.min(repoStats.stargazers_count, 100) / 100) * 30
    );

    const healthColor =
      healthScore >= 70
        ? chalk.green
        : healthScore >= 40
        ? chalk.yellow
        : chalk.red;
    const healthEmoji =
      healthScore >= 70 ? "🟢" : healthScore >= 40 ? "🟡" : "🔴";

    drawTableRow(
      "Repository Health",
      healthColor(`${healthEmoji} ${healthScore}/100`)
    );

    console.log("\n" + chalk.cyan("━".repeat(52)) + "\n");

    logger.info("Statistics displayed successfully");
  } catch (error) {
    spinner.stop();
    logger.error("Stats command failed", { error: error.message });
    handleError(error, "stats command");
  }
}

module.exports = statsCommand;
