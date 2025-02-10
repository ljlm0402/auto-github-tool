#!/usr/bin/env node
const { spawnSync } = require('child_process');
const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');

function runCommand(command, args = []) {
  const result = spawnSync(command, args, { encoding: 'utf-8', stdio: 'pipe' });
  if (result.error) throw new Error(`❌ Error: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`❌ Error: ${result.stderr}`);
  return result.stdout.trim();
}

function checkGitRepo() {
  try {
    runCommand('git', ['rev-parse', '--is-inside-work-tree']);
  } catch {
    throw new Error("❌ Not a git repository. Run 'git init' first.");
  }
}

function checkGhCli() {
  try {
    runCommand('gh', ['--version']);
  } catch {
    throw new Error("❌ GitHub CLI is not installed. Please install it first.");
  }
}

function showHelp() {
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

function getIssueTemplate() {
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

function createIssue() {
  try {
    checkGitRepo();
    checkGhCli();
  } catch (error) {
    console.error(error.message);
    return;
  }

  const title = readlineSync.question("📝 Enter issue title: ");
  const body = getIssueTemplate() || readlineSync.question("📄 Enter issue description: ");
  const labels = readlineSync.question("🏷 Enter labels (comma-separated, or press Enter to skip): ");
  const assignees = readlineSync.question("👥 Enter assignees (comma-separated, or press Enter to skip): ");
  const milestone = readlineSync.question("📅 Enter milestone (or press Enter to skip): ");

  const args = ['issue', 'create', '--title', title, '--body', body];
  if (labels) args.push('--label', labels);
  if (assignees) args.push('--assignee', assignees);
  if (milestone) args.push('--milestone', milestone);

  try {
    console.log(runCommand('gh', args));
  } catch (error) {
    console.error("❌ Error: Failed to create issue.", error.message);
  }
}

function listIssues() {
  try {
    checkGitRepo();
    checkGhCli();
    const issues = runCommand('gh', ['issue', 'list', '--state', 'open', '--json', 'number,title,labels', '-q', ".[] | [.number, .title, .labels[0].name] | @tsv"]);
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
    console.error("❌ Error: Failed to fetch issue list.", error.message);
  }
}

function createBranch() {
  const issues = listIssues();
  if (!issues.length) return;

  const issueNumber = readlineSync.question("🔢 Enter issue number to create branch: ");
  const issue = issues.find(i => i.number === issueNumber);
  if (!issue) {
    console.log("❌ Issue not found.");
    return;
  }

  const branchName = `${issue.label || 'feature'}/${issueNumber}-${issue.title.replace(/\s+/g, '-').toLowerCase()}`;
  runCommand('git', ['checkout', '-b', branchName]);
  console.log(`✅ Branch '${branchName}' created.`);
}

function createPullRequest() {
  checkGitRepo();
  checkGhCli();

  const title = readlineSync.question("📌 Enter PR title: ");
  const body = readlineSync.question("📝 Enter PR description: ");

  try {
    // 변경 사항이 있는지 확인
    const status = runCommand("git", ["status", "--porcelain"]);
    if (status) {
      console.log("⚠️ Uncommitted changes detected. Committing changes...");
      runCommand("git", ["add", "."]);
      runCommand("git", ["commit", "-m", `"Auto commit before PR: ${title}"`]);
    }

    // 현재 브랜치 가져오기
    const currentBranch = runCommand("git", ["branch", "--show-current"]);

    // 브랜치를 원격 저장소에 푸시
    console.log(`🚀 Pushing branch '${currentBranch}' to remote...`);
    runCommand("git", ["push", "-u", "origin", currentBranch]);

    // PR 생성 (HEAD 브랜치 지정)
    console.log("🔄 Creating pull request...");
    console.log(runCommand("gh", ["pr", "create", "--title", title, "--body", body, "--head", currentBranch]));
  } catch (error) {
    console.error("❌ Error: Failed to create pull request.", error.message);
  }
}


const command = process.argv[2];

switch (command) {
  case 'list':
    listIssues();
    break;
  case 'issue':
    createIssue();
    break;
  case 'branch':
    createBranch();
    break;
  case 'pr':
    createPullRequest();
    break;
  case '--help':
    showHelp();
    break;
  default:
    console.log("❌ Error: Unknown command. Use 'list', 'issue', 'branch', 'pr', or '--help'.");
}
