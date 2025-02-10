#!/usr/bin/env node

const { spawnSync } = require('child_process');
const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');

// 도움말
function showHelp() {
  console.log(`
Usage: agt <command> [options]

Commands:
list           오픈된 이슈 목록 조회
issue         새 이슈 생성 (--template, --description 옵션 지원)
branch        선택한 이슈 기반 브랜치 생성
pr            현재 브랜치에서 PR 생성

Options:
--help        사용 가능한 명령어 목록 출력
`);
}

function runCommand(command, args = []) {
  const result = spawnSync(command, args, { encoding: 'utf-8', stdio: 'pipe' });
  if (result.error) throw new Error(`❌ Error: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`❌ Error: ${result.stderr}`);
  return result.stdout.trim();
}

// github 레포지토리 체크
function checkGitRepo() {
  try {
    runCommand('git', ['rev-parse', '--is-inside-work-tree']);
  } catch {
    throw new Error("❌ Not a git repository. Run 'git init' first.");
  }
}

// gh 버전 체크
function checkGhCli() {
  try {
    runCommand('gh', ['--version']);
  } catch {
    throw new Error("❌ GitHub CLI is not installed. Please install it first.");
  }
}

// 이슈 템플릿 가져오기
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

// 이슈 생성
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

// 이슈 목록
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

// 브런치 생성
function createBranch() {
  const issueNumber = readlineSync.question("🔢 Enter issue number: ");
  const issueTitle = readlineSync.question("📝 Enter issue title: ");
  const branchType = readlineSync.question("🌿 Enter branch type (feature/bug): ", { defaultInput: 'feature' });
  const branchName = `${branchType}/${issueNumber}-${issueTitle.replace(/\s+/g, '-').toLowerCase()}`;

  try {
    runCommand('git', ['checkout', '-b', branchName]);
    console.log(`✅ Created and switched to branch: ${branchName}`);
  } catch (error) {
    console.error("❌ Error: Failed to create branch.", error.message);
  }
}

// 풀리퀘 생성
function createPullRequest() {
  const issueNumber = readlineSync.question("🔢 Enter issue number: ");
  const issueTitle = readlineSync.question("📝 Enter issue title: ");
  const branchType = readlineSync.question("🌿 Enter branch type (feature/bug): ", { defaultInput: 'feature' });
  const branchName = `${branchType}/${issueNumber}-${issueTitle.replace(/\s+/g, '-').toLowerCase()}`;
  const prBody = readlineSync.question("📄 Enter PR description: ");

  try {
    runCommand('git', ['push', '-u', 'origin', branchName]);
    console.log(runCommand('gh', ['pr', 'create', '--title', `[${branchType.toUpperCase()}] ${issueTitle}`, '--body', prBody, '--head', branchName]));
  } catch (error) {
    console.error("❌ Error: Failed to create pull request.", error.message);
  }
}

const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
    showHelp();
} else {
    const command = args[0];

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
      default:
        console.log("❌ Error: Unknown command. Use 'list', 'issue', 'branch', or 'pr'.");
    }
}
