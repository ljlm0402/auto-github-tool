<h1 align="center">
<br>
  <img src="https://github.com/user-attachments/assets/3ff372bb-9216-4537-81e9-59d91960b7ce" alt="Project Logo" />
  <br>
    <br>
  Auto GitHub Tool
  <br>
</h1>

<h4 align="center">🤖 A CLI tool to automate GitHub issue handling, branch creation, and PR submission.</h4>

<p align ="center">
  <a href="https://nodei.co/npm/auto-github-tool" target="_blank">
    <img src="https://nodei.co/npm/auto-github-tool.png" alt="npm Info" />
  </a>
</p>

<p align="center">
    <a href="http://npm.im/auto-github-tool" target="_blank">
      <img src="https://img.shields.io/npm/v/auto-github-tool.svg" alt="npm Version" />
    </a>
    <a href="http://npm.im/auto-github-tool" target="_blank">
      <img src="https://img.shields.io/github/v/release/ljlm0402/auto-github-tool" alt="npm Release Version" />
    </a>
    <a href="http://npm.im/auto-github-tool" target="_blank">
      <img src="https://img.shields.io/npm/dm/auto-github-tool.svg" alt="npm Downloads" />
    </a>
    <a href="http://npm.im/auto-github-tool" target="_blank">
      <img src="https://img.shields.io/npm/l/auto-github-tool.svg" alt="npm Package License" />
    </a>
</p>

<p align="center">
  <a href="https://github.com/ljlm0402/auto-github-tool/stargazers" target="_blank">
    <img src="https://img.shields.io/github/stars/ljlm0402/auto-github-tool" alt="github Stars" />
  </a>
  <a href="https://github.com/ljlm0402/auto-github-tool/network/members" target="_blank">
    <img src="https://img.shields.io/github/forks/ljlm0402/auto-github-tool" alt="github Forks" />
  </a>
  <a href="https://github.com/ljlm0402/auto-github-tool/stargazers" target="_blank">
    <img src="https://img.shields.io/github/contributors/ljlm0402/auto-github-tool" alt="github Contributors" />
  </a>
  <a href="https://github.com/ljlm0402/auto-github-tool/issues" target="_blank">
    <img src="https://img.shields.io/github/issues/ljlm0402/auto-github-tool" alt="github Issues" />
  </a>
</p>

<br />

## AGT 소개

AGT(Auto GitHub Tool)는 GitHub Issue를 기반으로 브랜치 관리와 풀 리퀘스트(PR) 생성을 자동화하여 개발자의 생산성을 향상시키고, 브랜치 관리의 일관성을 유지하는 CLI 도구입니다.

### ✨ 주요 기능

- **🎯 대화형 메뉴 모드**: 직관적인 메뉴로 모든 기능에 쉽게 접근
- **📋 이슈 관리**: 이슈 목록 조회 및 템플릿 기반 이슈 생성
- **🌿 브랜치 자동화**: 이슈 기반 브랜치 자동 생성 (feature/bugfix/hotfix/release)
- **🔀 PR 생성**: 템플릿 기반 풀 리퀘스트 자동 생성
- **🏷️ 라벨 관리**: GitHub 라벨 생성 및 관리
- **⚙️ 설정 파일**: 프로젝트별 또는 전역 설정 지원 (.agtrc.json)
- **🎨 향상된 UX**: 컬러 출력, 스피너, 입력 검증으로 더 나은 사용자 경험

## 📋 목차

- [요구 사항](#-요구-사항)
- [설치 및 실행](#-설치-및-실행)
- [사용법](#-사용법)
  - [대화형 모드](#대화형-모드-권장)
  - [직접 명령어 사용](#직접-명령어-사용)
  - [설정 파일](#설정-파일)
- [명령어 가이드](#-명령어-가이드)
  - [도움말](#1-도움말)
  - [이슈 목록 조회](#2-이슈-목록-조회)
  - [이슈 생성](#3-이슈-생성)
  - [브랜치 생성](#4-브랜치-생성)
  - [Pull Request 생성](#5-pull-request-생성)
  - [라벨 생성](#6-라벨-생성)
- [프로젝트 구조](#-프로젝트-구조)
- [개발자 가이드](#-개발자-가이드)
- [문제 해결](#-문제-해결)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

## 📌 요구 사항

- Node.js 14 이상
- GitHub CLI (gh) 설치 필요
- GitHub 계정이 필요합니다.

```sh
node -v # 버전 확인
gh --version  # 설치 확인
```

## 🚀 설치 및 실행

1. **GitHub CLI 설치**

   ```bash
   # Homebrew를 통한 설치
   brew install gh
   ```

2. **GitHub 계정 연동**

   ```bash
   gh auth login
   ```

   - 프롬프트에 따라 진행:
     1. `? What account do you want to log into?` → `GitHub.com` 선택
     2. `? What is your preferred protocol for Git operations?` → `HTTPS` 선택
     3. `? Authenticate Git with your GitHub credentials?` → `Yes` 선택
     4. `? How would you like to authenticate GitHub CLI?` → `Login with a web browser` 선택
     5. 표시된 one-time code를 복사
     6. 자동으로 열리는 브라우저에서 GitHub 로그인
     7. 복사한 코드 입력하여 인증 완료

3. **AGT 설치**

   ```bash
   npm install -g auto-github-tool
   ```

   설치 후 `agt` 명령어를 사용하여 실행할 수 있습니다.

## 🛠 사용법

### 대화형 모드 (권장)

가장 쉬운 사용 방법입니다. 명령어 없이 `agt`만 입력하면 대화형 메뉴가 표시됩니다:

```bash
$ agt

╔════════════════════════════════════════╗
║   🤖 Auto GitHub Tool - Main Menu    ║
╚════════════════════════════════════════╝

? What would you like to do? (Use arrow keys)
❯ 📋 List open issues
  ➕ Create a new issue
  🌿 Create a branch from an issue
  🔀 Create a pull request
  🏷️  Create a new label
  ─────────────
  ⚙️  Configure AGT settings
  ❓ Show help
  ─────────────
  🚪 Exit
```

### 직접 명령어 사용

특정 작업을 바로 실행하고 싶다면 명령어를 직접 입력할 수 있습니다:

```bash
agt help      # 사용 가능한 명령어 목록 출력
agt list      # 오픈된 이슈 목록 조회
agt issue     # 새 이슈 생성
agt branch    # 선택한 이슈 기반 브랜치 생성
agt pr        # 현재 브랜치에서 PR 생성
agt label     # 라벨 생성
agt config    # 설정 초기화
```

### 설정 파일

AGT는 프로젝트별 또는 전역 설정을 지원합니다.

#### 설정 초기화

```bash
# 프로젝트 로컬 설정 (.agtrc.json)
$ agt config

# 전역 설정 (~/.agtrc.json)
$ agt config --global
```

#### 설정 파일 예시 (.agtrc.json)

프로젝트에 `.agtrc.example.json` 파일이 포함되어 있습니다. 이를 복사해서 사용하세요:

```bash
cp .agtrc.example.json .agtrc.json
```

```json
{
  "defaultBaseBranch": "main",
  "branchTypes": [
    { "id": "1", "name": "feature", "description": "Develop new features" },
    { "id": "2", "name": "bugfix", "description": "Fix bugs" },
    { "id": "3", "name": "hotfix", "description": "Urgent fixes" },
    { "id": "4", "name": "release", "description": "Prepare for a release" }
  ],
  "autoAssign": true,
  "defaultLabels": [],
  "autoTemplates": true
}
```

**설정 항목:**

- `defaultBaseBranch`: PR 생성 시 기본 base 브랜치
- `branchTypes`: 브랜치 타입 정의
- `autoAssign`: 자동으로 자신을 assignee로 설정
- `defaultLabels`: 기본으로 적용할 라벨 목록
- `autoTemplates`: 템플릿 자동 사용 여부

## 📚 명령어 가이드

### 1. 도움말

```bash
$ agt help

╔════════════════════════════════════════╗
║        AGT Command Reference          ║
╚════════════════════════════════════════╝

Usage:
  agt [command]

Commands:
  (no command)    Start interactive menu
  help            Show this help message
  list            Show open issues
  issue           Create a new issue
  branch          Create a branch from an issue
  pr              Create a pull request
  label           Create a new label
  config          Configure AGT settings

Configuration Files:
  .agtrc.json     Project-specific settings
  ~/.agtrc.json   User-wide settings

Quick Start:
  $ agt                # Interactive mode (recommended for beginners)
  $ agt list           # View open issues
  $ agt config         # Initialize configuration
```

### 2. 이슈 목록 조회

현재 저장소의 모든 오픈 이슈를 조회합니다.

```bash
$ agt list

=== 📋 Open Issues ===

123 Fix login bug [bug]
124 Add dark mode feature [enhancement]
125 Update documentation [documentation]
```

### 3. 이슈 생성

템플릿을 활용한 이슈 생성을 지원합니다.

```bash
$ agt issue

📍 Enter issue title: Fix login authentication issue

📌 Available Issue Templates:
1. bug_report.md
2. feature_request.md
3. question.md
Select a template number or press Enter to skip: 1

🐞 Describe the bug clearly: Users cannot login with valid credentials
✅ What did you expect to happen?: Successful login
...

👥 Enter assignees (comma-separated, or press Enter to skip):
✓ Assignee set to your account: yourusername

=== 📋 Available Labels ===
[1] bug
[2] enhancement
[3] documentation
...
🏷 Select labels [1...9 / a, b, c]: 1

🏷️ Selected Labels: bug

📅 Enter milestone (or press Enter to skip): v1.0

⠋ Creating GitHub issue...
✅ GitHub issue created successfully.
```

### 4. 브랜치 생성

이슈 번호를 선택하여 자동으로 브랜치를 생성합니다.

**브랜치 명명 규칙:** `{type}/{issue-number}-{sanitized-title}`

```bash
$ agt branch

=== 📋 Open Issues ===

123 Fix login bug [bug]
124 Add dark mode feature [enhancement]

🔢 Enter issue number to create branch: 123

📌 Select a branch type:
[1] feature - Develop new features
[2] bugfix - Fix bugs
[3] hotfix - Urgent fixes
[4] release - Prepare for a release

🔢 Enter the branch type number: 2

⠋ Creating branch 'bugfix/123-fix-login-bug'...
✅ Branch 'bugfix/123-fix-login-bug' has been successfully created.
```

### 5. Pull Request 생성

현재 브랜치에서 PR을 자동으로 생성합니다. 템플릿을 지원하며 관련 이슈를 자동으로 연결할 수 있습니다.

```bash
$ agt pr

� Enter PR title: Fix login authentication bug

📌 Provide a short summary of your changes: Fixed session validation logic

=== 📋 Open Issues ===
123 Fix login bug [bug]

🔍 Enter the related issue number (e.g., #27): 123
✨ Describe the major changes in your PR: Updated auth middleware
✅ Have you tested the changes locally? (yes/no): yes
📏 Does your code follow the project's style guidelines? (yes/no): yes
📖 Have you updated the documentation if necessary? (yes/no): yes
🔗 Add any additional information (optional):

👀 Enter reviewers (comma-separated, or press Enter to skip):
👥 Enter assignees (comma-separated, or press Enter to skip):
✓ Assignee set to your account: yourusername

=== 📋 Available Labels ===
[1] bug
[2] enhancement
🏷 Select labels [1...9 / a, b, c]: 1

🏷️ Selected Labels: bug

📅 Enter milestone (or press Enter to skip): v1.0

🌿 Available branches:
[1] main (default)
[2] development
Select base branch (or press Enter for 'main'):

Current branch: bugfix/123-fix-login-bug
Found 3 commit(s) to push.

⠋ Pushing branch 'bugfix/123-fix-login-bug' to remote...
✅ Branch 'bugfix/123-fix-login-bug' pushed successfully.
⠋ Creating pull request...
✅ Pull request created successfully.
```

### 6. 라벨 생성

GitHub 저장소에 새로운 라벨을 생성합니다.

```bash
$ agt label

🏷 Enter label name: urgent
🎨 Enter label color (6-digit hex, e.g., FFFFFF) [default: FFFFFF]: FF0000
📝 Enter label description (optional): Urgent issues that need immediate attention

⠋ Creating label 'urgent'...
✅ Label 'urgent' has been successfully created.
```

## 🔍 문제 해결

### ❌ 일반적인 오류

1. **Git 저장소가 아닌 경우**

   ```
   ❌ This is not a Git repository. Please run 'git init' first.
   ```

   ➡️ 해결: `git init` 명령어로 Git 저장소 초기화

2. **GitHub CLI 인증 오류**

   ```
   ❌ GitHub authentication failed. Please run 'gh auth login' first.
   ```

   ➡️ 해결: `gh auth login` 실행하여 재인증

3. **GitHub CLI 미설치**

   ```
   ❌ GitHub CLI is not installed. Please install it: https://cli.github.com/
   ```

   ➡️ 해결: `brew install gh` (macOS) 또는 공식 사이트에서 설치

4. **브랜치가 존재하지 않음**

   ```
   ❌ Source branch 'feature/123-...' does not exist
   ```

   ➡️ 해결: `agt branch`로 브랜치 먼저 생성

5. **커밋이 없는 경우**
   ```
   ❌ No commits found between 'main' and 'feature/123-...'.
   Please commit your changes before creating a PR.
   ```
   ➡️ 해결: 변경사항을 커밋한 후 PR 생성

## 🤝 기여하기

기여는 언제나 환영합니다! 다음 단계를 따라주세요:

1. 이 저장소를 Fork 합니다
2. Feature 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push 합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

또는 `agt`를 사용해서 워크플로우를 자동화할 수 있습니다! 😉

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/ljlm0402">AGUMON</a> 🦖
</p>
