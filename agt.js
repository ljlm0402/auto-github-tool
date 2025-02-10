#!/usr/bin/env node
const { spawnSync } = require('child_process');
const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');

/**
 * 실행 가능한 명령어를 실행하고 결과를 반환
 */
function executeCommand(command, args = []) {
  const result = spawnSync(command, args, { encoding: 'utf-8', stdio: 'pipe' });
  if (result.error) throw new Error(`❌ Command execution failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`❌ Command returned an error: ${result.stderr}`);
  return result.stdout.trim();
}

/**
 * Git 저장소인지 확인
 */
function validateGitRepository() {
  try {
    executeCommand('git', ['rev-parse', '--is-inside-work-tree']);
  } catch {
    throw new Error("❌ This is not a Git repository. Please run 'git init' first.");
  }
}

/**
 * GitHub CLI가 설치되어 있는지 확인
 */
function validateGitHubCLI() {
  try {
    executeCommand('gh', ['--version']);
  } catch {
    throw new Error("❌ GitHub CLI is not installed. Please install it before proceeding.");
  }
}

/**
 * 도움말 출력
 */
function displayHelp() {
  console.log(`
    Usage: agt <command> [options]

    Commands:
      list           Show open issues
      issue          Create a new issue
      branch         Create a branch from an issue
      pr             Create a pull request
      --help         Show this help message

    Examples:
      agt list
      agt issue
      agt branch
      agt pr
  `);
}

/**
 * 이슈 템플릿 가져오기
 */
function fetchIssueTemplate() {
  const templateDir = path.join('.github', 'ISSUE_TEMPLATE');
  if (fs.existsSync(templateDir)) {
    const files = fs.readdirSync(templateDir).filter(file => file.endsWith('.md'));
    if (files.length > 0) {
      console.log("📌 Available Issue Templates:");
      files.forEach((file, index) => console.log(`${index + 1}. ${file}`));
      const choice = readlineSync.question("Select a template number or press Enter to skip: ");
      if (files[parseInt(choice) - 1]) {
        return fs.readFileSync(path.join(templateDir, files[parseInt(choice) - 1]), 'utf-8');
      }
    }
  }
  return "";
}

/**
 * GitHub 이슈 생성
 */
function createGitHubIssue() {
  try {
    validateGitRepository();
    validateGitHubCLI();
  } catch (error) {
    console.error(error.message);
    return;
  }

  const title = readlineSync.question("📝 Enter issue title: ");
  const body = fetchIssueTemplate() || readlineSync.question("📄 Enter issue description: ");
  const labels = readlineSync.question("🏷 Enter labels (comma-separated, or press Enter to skip): ");
  const assignees = readlineSync.question("👥 Enter assignees (comma-separated, or press Enter to skip): ");
  const milestone = readlineSync.question("📅 Enter milestone (or press Enter to skip): ");

  const args = ['issue', 'create', '--title', title, '--body', body];
  if (labels) args.push('--label', labels);
  if (assignees) args.push('--assignee', assignees);
  if (milestone) args.push('--milestone', milestone);

  try {
    console.log(executeCommand('gh', args));
  } catch (error) {
    console.error("❌ Failed to create issue:", error.message);
  }
}

/**
 * 오픈된 GitHub 이슈 목록 조회
 */
function fetchOpenIssues() {
  try {
    validateGitRepository();
    validateGitHubCLI();
    const issues = executeCommand('gh', ['issue', 'list', '--state', 'open', '--json', 'number,title,labels', '-q', ".[] | [.number, .title, .labels[0].name] | @tsv"]);
    if (!issues.trim()) {
      console.log("✅ No open issues found.");
      return [];
    }
    console.log("=== 📋 Open Issues ===");
    console.log(issues);
    return issues.split('\n').map(line => {
      const [number, title, label] = line.split('\t');
      return { number, title, label };
    });
  } catch (error) {
    console.error("❌ Unable to fetch open issues:", error.message);
  }
}

/**
 * Git 브랜치 생성
 */
function createGitBranch() {
  const issues = fetchOpenIssues();
  if (!issues.length) return;

  const issueNumber = readlineSync.question("🔢 Enter issue number to create branch: ");
  const issue = issues.find(i => i.number === issueNumber);
  if (!issue) {
    console.log("❌ Issue not found. Please enter a valid issue number.");
    return;
  }

  const branchName = `${issue.label || 'feature'}/${issueNumber}-${issue.title.replace(/\s+/g, '-').toLowerCase()}`;
  executeCommand('git', ['checkout', '-b', branchName]);
  console.log(`✅ Branch '${branchName}' has been successfully created.`);
}

/**
 * GitHub PR 생성
 */
function createGitHubPullRequest() {
  validateGitRepository();
  validateGitHubCLI();

  const title = readlineSync.question("📌 Enter PR title: ");
  const body = readlineSync.question("📝 Enter PR description: ");
  const reviewers = readlineSync.question("👥 Enter reviewers (comma-separated, or press Enter to skip): ");

  try {
    const currentUser = executeCommand("gh", ["api", "user", "-q", ".login"]);
    const currentBranch = executeCommand("git", ["branch", "--show-current"]);
    console.log(`🚀 Pushing branch '${currentBranch}' to remote repository...`);
    executeCommand("git", ["push", "-u", "origin", currentBranch]);

    console.log("🔄 Creating a new pull request...");
    const prArgs = ["pr", "create", "--title", title, "--body", body, "--head", currentBranch, "--assignee", currentUser];
    if (reviewers) {
      prArgs.push("--reviewer", reviewers);
    }
    console.log(executeCommand("gh", prArgs));
  } catch (error) {
    console.error("❌ Failed to create pull request:", error.message);
  }
}

const command = process.argv[2];

switch (command) {
  case 'list':
    fetchOpenIssues();
    break;
  case 'issue':
    createGitHubIssue();
    break;
  case 'branch':
    createGitBranch();
    break;
  case 'pr':
    createGitHubPullRequest();
    break;
  case '--help':
    displayHelp();
    break;
  default:
    console.log("❌ Unknown command. Use 'list', 'issue', 'branch', 'pr', or '--help'.");
}
