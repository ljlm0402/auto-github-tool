const { execSync } = require('child_process');
const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');

// Git 저장소 여부 확인
function checkGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  } catch (error) {
    console.error("Error: Not a git repository. Please run 'git init' first.");
    process.exit(1);
  }
}

// GitHub CLI 설치 여부 확인
function checkGhCli() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (error) {
    console.error("Error: GitHub CLI is not installed. Please install it first.");
    process.exit(1);
  }
}

// 이슈 템플릿 가져오기
function getIssueTemplate() {
  const templateDir = path.join('.github', 'ISSUE_TEMPLATE');
  if (fs.existsSync(templateDir)) {
    const files = fs.readdirSync(templateDir).filter(file => file.endsWith('.md'));
    if (files.length > 0) {
      console.log("Available Issue Templates:");
      files.forEach((file, index) => console.log(`${index + 1}. ${file}`));
      const choice = readlineSync.question("Select a template number or press Enter to skip: ");
      const templateFile = files[parseInt(choice) - 1];
      if (templateFile) {
        return fs.readFileSync(path.join(templateDir, templateFile), 'utf-8');
      }
    }
  }
  return "";
}

// 이슈 목록 출력
function listIssues() {
  checkGitRepo();
  checkGhCli();
  try {
    const issues = execSync("gh issue list --json number,title -q '.[] | [.number, .title] | @tsv'", { encoding: 'utf-8' });
    if (!issues.trim()) {
      console.log("No open issues found.");
      return [];
    }
    console.log("=== Open Issues ===");
    console.log(issues);
    return issues.split('\n').map(line => {
      const [number, title] = line.split('\t');
      return { number, title };
    });
  } catch (error) {
    console.error("Error: Failed to fetch issue list.");
    process.exit(1);
  }
}

// 이슈 생성
function createIssue() {
  checkGitRepo();
  checkGhCli();
  const title = readlineSync.question("Enter issue title: ");
  let body = getIssueTemplate();
  if (!body) {
    body = readlineSync.question("Enter issue description: ");
  }

  const tempFilePath = path.join(__dirname, 'temp_issue_body.md');
  fs.writeFileSync(tempFilePath, body, 'utf-8');

  try {
    const output = execSync(`gh issue create --title "${title}" --body-file "${tempFilePath}"`, { encoding: 'utf-8' });
    console.log("Issue created successfully!\n" + output);
  } catch (error) {
    console.error("Error: Failed to create issue.");
    process.exit(1);
  } finally {
    fs.unlinkSync(tempFilePath);
  }
}

// 이슈 기반 브랜치 생성
function createBranch() {
  const issues = listIssues();
  if (issues.length === 0) {
    console.log("No open issues available to create a branch.");
    return;
  }

  const issueNumber = readlineSync.question("Enter issue number to create a branch: ");
  if (!issues.some(issue => issue.number === issueNumber)) {
    console.error("Error: Issue number does not exist.");
    return;
  }

  const branchName = `feature-#${issueNumber}`;
  execSync(`git checkout -b ${branchName}`);
  console.log(`Switched to new branch '${branchName}'`);
}

// PR 생성
function createPr() {
  checkGitRepo();
  checkGhCli();
  const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: 'utf-8' }).trim();
  const match = currentBranch.match(/feature-#(\d+)/);

  if (!match) {
    console.error("Error: Current branch is not a valid feature branch.");
    process.exit(1);
  }

  const issueNumber = match[1];
  const issueTitle = execSync(`gh issue view ${issueNumber} --json title -q .title`, { encoding: 'utf-8' }).trim();
  const prTitle = `${issueTitle}`;

  const prBody = readlineSync.question("Enter PR description (or press Enter to autofill): ");
  const command = prBody ?
    `gh pr create --title "${prTitle}" --body "${prBody}"` :
    `gh pr create --title "${prTitle}" --fill`;

  execSync(command);
  console.log("Pull request created successfully!");
}

// 메인 실행 로직
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
    createPr();
    break;
  default:
    console.log("Usage: node agt.js <command>");
    console.log("Available Commands: list, issue, branch, pr");
    process.exit(1);
}
