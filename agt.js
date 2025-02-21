#!/usr/bin/env node

/*****************************************************************
 📍 Create Auto GitHub Tool
 🗓️ 2025.02.10 ~
 🧑‍💻 Made By AGUMON
 🌐 https://github.com/ljlm0402/auto-github-tool
 *****************************************************************/

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
 * GitHub Issue 필드 값 입력
 */
async function replacePlaceholders(template, questions) {
  for (const key in questions) {
    const prompt = questions[key];
    template = template.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), readlineSync.question(prompt));
  }
  return template;
}

/**
 * GitHub 저장소에서 라벨 목록을 가져옴
 */
function fetchGitHubLabels() {
  try {
    const labels = executeCommand('gh', ['label', 'list', '--json', 'name', '-q', '.[] | .name']);
    if (!labels.trim()) {
      console.log("✅ No labels found.");
      return [];
    }

    console.log("=== 📋 Available Labels ===");
    return labels.split('\n').map(label => label.trim());
  } catch (error) {
    console.error("❌ Failed to fetch labels:", error.message);
    return [];
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
      label          Create a new label
      --help         Show this help message

    Examples:
      agt list
      agt issue
      agt branch
      agt pr
      agt label
  `);
}

/**
 * 이슈 템플릿 가져오기
 */
async function fetchIssueTemplate() {
  const templateDir = path.join('.github', 'ISSUE_TEMPLATE');

  if (fs.existsSync(templateDir)) {
    const files = fs.readdirSync(templateDir).filter(file => file.endsWith('.md'));
    if (files.length > 0) {
      console.log("📌 Available Issue Templates:");
      files.forEach((file, index) => console.log(`${index + 1}. ${file}`));

      const choice = readlineSync.question("Select a template number or press Enter to skip: ");
      const templateChoice = parseInt(choice) - 1;
      if (files[templateChoice]) {
        let template = fs.readFileSync(path.join(templateDir, files[templateChoice]), 'utf-8');
        let questions = {};

        switch (templateChoice) {
          case 0: { // bug_report.md
            questions = {
              'Description': '🐞 Describe the bug clearly: ',
              'Expected': '✅ What did you expect to happen?: ',
              'Actual': 'What actually happened?: ',
              'OS': '💻 What operating system are you using? (e.g., Windows, macOS, Linux): ',
              'NodeVersion': '🛠 Enter your Node.js version (e.g., 16.x): ',
              'PackageManagerVersion': '📦 Enter your NPM/Yarn version (e.g., 8.x): ',
              'Dependencies': '🔗 List any other relevant dependencies (optional): ',
              'Additional': '📎 Add any additional context (optional): '
            };
          } break;
          case 1: { // feature_request.md
            questions = {
              'Motivation': '❓ Explain why this feature is needed and what problem it solves: ',
              'Solution': '💡 Describe the proposed solution: ',
              'Alternatives': '🔄 What alternatives have you considered?: ',
              'Additional': '📎 Add any other relevant information or references (optional): '
            };
          } break;
          case 2: { // question.md
            questions = {
              'Summary': '❓ Summarize your question: ',
              'Additional': '📎 Add any other relevant information (optional): '
            };
          } break;
        }

        const result = await replacePlaceholders(template, questions);
        return result;
      }
    }
  }
  return "";
}

/**
 * GitHub 이슈 생성
 */
async function createGitHubIssue() {
  try {
    validateGitRepository();
    validateGitHubCLI();
  } catch (error) {
    console.error(error.message);
    return;
  }

  // 1. PR 제목 및 설명 입력
  const title = readlineSync.question("📝 Enter issue title: ");
  const body = await fetchIssueTemplate() || readlineSync.question("📄 Enter issue description: ");

  // 2. Assignees 입력, 없으면 자동으로 자신의 GitHub 계정으로 설정
  let assignees = readlineSync.question("👥 Enter assignees (comma-separated, or press Enter to skip): ");
  if (!assignees) {
    const currentUser = executeCommand("gh", ["api", "user", "-q", ".login"]);
    assignees = currentUser;  // 자신의 계정 자동 추가
    console.log(`👥 Assignee set to your account: ${assignees}`);
  }

  // 3. label 목록을 받아와서 선택하도록 처리
  const availableLabels = fetchGitHubLabels();
  let selectedLabels = '';  // selectedLabels 변수 선언

  if (availableLabels.length > 0) {
    const labelChoice = readlineSync.keyInSelect(availableLabels, "Select label(s) for the issue (use comma for multiple):");
    if (labelChoice !== -1) {
      selectedLabels = availableLabels[labelChoice]; // 선택된 라벨 저장
      console.log(`🏷 Selected Label: ${selectedLabels}`);
    }
  }

  // 4. Milestone 입력
  const milestone = readlineSync.question("📅 Enter milestone (or press Enter to skip): ");

  const args = ['issue', 'create', '--title', title, '--body', body];
  if (assignees) args.push('--assignee', assignees);
  if (selectedLabels) args.push('--label', selectedLabels);
  if (milestone) args.push('--milestone', milestone);

  try {
    console.log(executeCommand('gh', args));
    console.log("✅ GitHub issue created successfully.");
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

  // 1. 이슈 선택
  const issueNumber = readlineSync.question("🔢 Enter issue number to create branch: ");
  const issue = issues.find(i => i.number === issueNumber);
  if (!issue) {
    console.log("❌ Issue not found. Please enter a valid issue number.");
    return;
  }

  // 2. 브랜치 타입 선택
  console.log("📌 Select a branch type:");
  const branchTypes = [
    { id: '1', name: 'feature', description: 'Develop new features' },
    { id: '2', name: 'bugfix', description: 'Fix bugs' },
    { id: '3', name: 'hotfix', description: 'Urgent fixes' },
    { id: '4', name: 'release', description: 'Prepare for a release' },
  ];
  branchTypes.forEach(branch => {
    console.log(`[${branch.id}] ${branch.name} - ${branch.description}`);
  });

  const branchTypeId = readlineSync.question("🔢 Enter the branch type number: ");
  const selectedBranchType = branchTypes.find(branch => branch.id === branchTypeId);

  if (!selectedBranchType) {
    console.log("❌ Invalid branch type selected.");
    return;
  }

  // 3. 브랜치 이름 생성
  const branchName = `${selectedBranchType.name}/${issueNumber}-${issue.title.replace(/\s+/g, '-').toLowerCase()}`;
  executeCommand('git', ['checkout', '-b', branchName]);
  console.log(`✅ Branch '${branchName}' has been successfully created.`);
}

/**
 * GitHub PR 생성
 */
async function createGitHubPullRequest() {
  try {
    validateGitRepository();
    validateGitHubCLI();
  } catch (error) {
    console.error(error.message);
    return;
  }

  // 1. PR 제목 및 설명 입력
  const title = readlineSync.question("📌 Enter PR title: ");
  const body = readlineSync.question("📝 Enter PR description: ");

  // 2. Reviewers 입력
  const reviewers = readlineSync.question("👀 Enter reviewers (comma-separated, or press Enter to skip): ");

  // 3. Assignees 입력, 없으면 자동으로 자신의 GitHub 계정으로 설정
  let assignees = readlineSync.question("👥 Enter assignees (comma-separated, or press Enter to skip): ");
  if (!assignees) {
    const currentUser = executeCommand("gh", ["api", "user", "-q", ".login"]);
    assignees = currentUser;
    console.log(`👥 Assignee set to your account: ${assignees}`);
  }

  // 4. label 선택
  const labels = fetchGitHubLabels();
  const selectedLabels = labels.length
    ? readlineSync.keyInSelect(labels, "🏷 Select labels:", { cancel: false })
    : "";

  // 5. Milestone 입력
  const milestone = readlineSync.question("📅 Enter milestone (or press Enter to skip): ");

  // 6. Development (Link an issue from this repository) 이슈 목록 보여주기 (여러 개 선택 가능)
  // const issues = fetchOpenIssues();
  // let selectedIssues = [];
  // if (issues.length) {
  //   const selectedIssuesInput = readlineSync.question(`🔗 Link an issue(s) from this repository (comma-separated issue numbers): `);
  //   selectedIssues = selectedIssuesInput.split(',').map(issue => issue.trim()).filter(issue => issue);
  // }

  // 7. Base 브랜치 선택 (origin/ 제거)
  const branches = executeCommand('git', ['branch', '--list', '--remotes'])
    .split('\n')
    .map(branch => branch.trim().replace('origin/', ''))
    .filter(branch => branch);

  const baseBranchIndex = readlineSync.keyInSelect(branches, "🌿 Select base branch:", { cancel: false });
  const baseBranch = baseBranchIndex !== -1 ? branches[baseBranchIndex] : "main";

  // 8. 현재 브랜치 가져오기
  const currentBranch = executeCommand("git", ["branch", "--show-current"]).trim();

  // 9. 현재 브랜치가 base 브랜치보다 앞서 있는지 확인 (커밋 여부 체크)
  const commitCount = executeCommand("git", ["rev-list", "--count", `${baseBranch}..${currentBranch}`]).trim();
  if (commitCount === "0") {
    console.error(`❌ No commits found between '${baseBranch}' and '${currentBranch}'. Please commit your changes before creating a PR.`);
    return;
  }

  // 10. PR 생성
  try {
    console.log(`🚀 Pushing branch '${currentBranch}' to remote repository...`);
    executeCommand("git", ["push", "-u", "origin", currentBranch]);

    console.log("🔄 Creating a new pull request...");
    const prArgs = ["pr", "create", "--title", title, "--body", body, "--head", currentBranch, "--base", baseBranch];
    if (reviewers) prArgs.push("--reviewer", reviewers);
    if (assignees) prArgs.push("--assignee", assignees);
    if (selectedLabels) prArgs.push("--label", selectedLabels);
    if (milestone) prArgs.push("--milestone", milestone);
    // if (selectedIssues.length) prArgs.push("--linked-issues", selectedIssues.join(',')); // ✅ 'linked-issue' → 'linked-issues' 수정

    console.log(executeCommand("gh", prArgs));
    console.log("✅ Pull request created successfully.");
  } catch (error) {
    console.error("❌ Failed to create pull request:", error.message);
  }
}

/**
 * GitHub 라벨 생성
 */
function createGitHubLabel() {
  try {
    validateGitRepository();
    validateGitHubCLI();
  } catch (error) {
    console.error(error.message);
    return;
  }

  const labelName = readlineSync.question("🏷 Enter label name: ");
  const labelColor = readlineSync.question("🎨 Enter label color (optional, default is 'FFFFFF'): ") || 'FFFFFF';
  const labelDescription = readlineSync.question("📝 Enter label description (optional): ");

  const args = ['label', 'create', labelName, '--color', labelColor];
  if (labelDescription) args.push('--description', labelDescription);

  try {
    console.log(executeCommand('gh', args));
    console.log(`✅ Label '${labelName}' has been successfully created.`);
  } catch (error) {
    console.error("❌ Failed to create label:", error.message);
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
  case 'label':
    createGitHubLabel();
  break;
  case '--help':
    displayHelp();
    break;
  default:
    console.log("❌ Unknown command. Use 'list', 'issue', 'branch', 'pr', or '--help'.");
}
