<h1 align="center">
<br>
  <img src="https://github.com/user-attachments/assets/3ff372bb-9216-4537-81e9-59d91960b7ce" width="600" alt="Project Logo" />
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

<p align="center">
    <strong><a href="./README.md">English</a> · 한국어</strong>
</p>

---

## AGT 소개

AGT(Auto GitHub Tool)는 GitHub Issue를 기반으로 브랜치 관리와 풀 리퀘스트(PR) 생성을 자동화하여 개발자의 생산성을 향상시키고, 브랜치 관리의 일관성을 유지하는 CLI 도구입니다.

### ✨ 주요 기능

- **🎯 대화형 메뉴 모드**: 직관적인 메뉴로 모든 기능에 쉽게 접근
- **📋 이슈 관리**: 이슈 목록 조회 및 템플릿 기반 이슈 생성
- **🌿 브랜치 자동화**: 이슈 기반 브랜치 자동 생성 (feature/bugfix/hotfix/release)
- **🔀 PR 생성**: 템플릿 기반 풀 리퀘스트 자동 생성
- **🏷️ 라벨 관리**: GitHub 라벨 생성 및 관리
- **⚙️ 설정 파일**: 프로젝트별 또는 전역 설정 지원 (.agtrc.json)
- **🪄 설정 마법사**: 첫 사용자를 위한 대화형 5단계 설정 마법사
- **🎨 향상된 UX**: 컬러 출력, 스피너, 입력 검증으로 더 나은 사용자 경험
- **📊 로깅 시스템**: 디버깅 및 추적을 위한 `~/.agt/agt.log` 포괄적 로깅
- **⚡ 스마트 캐싱**: 성능 향상을 위한 GitHub API 응답 자동 캐싱
- **🔄 에러 복구**: 통합 에러 핸들링 시스템과 자동 재시도 메커니즘
- **✅ 입력 검증**: 쉘 인젝션 방지를 위한 다층 보안 검증
- **📈 성능 최적화**: 병렬 API 호출로 50-75% 더 빠른 명령 실행

## 📋 목차

- [요구 사항](#-요구-사항)
- [설치 및 실행](#-설치-및-실행)
- [빠른 시작](#-빠른-시작)
- [사용법](#-사용법)
  - [대화형 모드](#대화형-모드-권장)
  - [직접 명령어 사용](#직접-명령어-사용)
  - [설정 파일](#설정-파일)
- [명령어 가이드](#-명령어-가이드)
  - [설정 마법사](#1-설정-마법사)
  - [도움말](#2-도움말)
  - [이슈 목록 조회](#3-이슈-목록-조회)
  - [이슈 생성](#4-이슈-생성)
  - [브랜치 생성](#5-브랜치-생성)
  - [Pull Request 생성](#6-pull-request-생성)
  - [라벨 생성](#7-라벨-생성)
  - [저장소 통계](#8-저장소-통계)
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

## 🚀 빠른 시작

AGT를 시작하는 가장 쉬운 방법은 설정 마법사를 사용하는 것입니다:

```bash
$ agt setup

╔════════════════════════════════════════════════╗
║          🚀 AGT Setup Wizard                  ║
╚════════════════════════════════════════════════╝

This wizard will help you configure AGT for the first time.
It will check your environment and guide you through the setup.

✅ Step 1: Checking Git Installation
   ✓ Git is installed (version 2.39.0)

✅ Step 2: Checking GitHub CLI Installation
   ✓ GitHub CLI is installed (version 2.40.0)

✅ Step 3: Verifying GitHub Authentication
   ✓ Authenticated as yourusername

✅ Step 4: Testing GitHub Connection
   ✓ Successfully connected to GitHub API

⚙️  Step 5: AGT Configuration (Optional)
   ? Where would you like to store the configuration?
   ❯ 📁 Local (current project only)
     🌍 Global (all projects)
     ⏭️  Skip for now

╔════════════════════════════════════════════════╗
║            Setup Summary                      ║
╚════════════════════════════════════════════════╝

✅ PASS  Git installation
✅ PASS  GitHub CLI installation
✅ PASS  GitHub authentication
✅ PASS  GitHub connection
⏭️  SKIP  AGT configuration

🎉 Setup completed successfully!

You're ready to use Auto GitHub Tool!

Quick Start:
  • Run 'agt' to start interactive mode
  • Run 'agt help' to see all commands
  • Run 'agt list' to view open issues
```

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
agt setup     # 설정 마법사 실행 (처음 사용하는 경우)
agt list      # 오픈된 이슈 목록 조회
agt issue     # 새 이슈 생성
agt branch    # 선택한 이슈 기반 브랜치 생성
agt pr        # 현재 브랜치에서 PR 생성
agt label     # 라벨 생성
agt stats     # 저장소 통계 보기
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

### 1. 설정 마법사

처음 AGT를 설정하는 데 도움을 주는 대화형 설정 마법사입니다.

```bash
$ agt setup

╔════════════════════════════════════════════════╗
║          🚀 AGT Setup Wizard                  ║
╚════════════════════════════════════════════════╝

This wizard will check:
  ✓ Git installation
  ✓ GitHub CLI installation
  ✓ GitHub authentication
  ✓ GitHub connection
  ⚙️  AGT configuration (optional)

Run this command when:
  • First time using AGT
  • After reinstalling dependencies
  • Having authentication issues
  • Want to reconfigure AGT
```

**주요 기능:**

1. **Git 확인**: Git이 설치되어 있고 접근 가능한지 확인
2. **GitHub CLI 확인**: GitHub CLI (gh)가 설치되어 있는지 확인
3. **인증 확인**: GitHub 인증 상태 확인
4. **연결 테스트**: GitHub API 연결 테스트
5. **설정**: 로컬 또는 전역 설정 파일 생성 (생략 가능)

**특징:**

- ✅ 도움이 되는 오류 메시지와 함께 순차 검증
- 🔄 실패한 단계에 대한 대화형 복구 옵션
- ⏭️ 기본 설정을 사용하려면 설정 단계 건너뛰기 가능
- 📊 마지막에 상세한 요약 제공

### 2. 도움말

```bash
$ agt help

╔════════════════════════════════════════╗
║        AGT Command Reference          ║
╚════════════════════════════════════════╝

Usage:
  agt [command]

Commands:
  (no command)    Start interactive menu
  setup           Run setup wizard (recommended for first-time users)
  help            Show this help message
  list            Show open issues
  issue           Create a new issue
  branch          Create a branch from an issue
  pr              Create a pull request
  label           Create a new label
  stats           Show repository statistics
  config          Configure AGT settings

Configuration Files:
  .agtrc.json     Project-specific settings
  ~/.agtrc.json   User-wide settings

Quick Start:
  $ agt                # Interactive mode (recommended for beginners)
  $ agt setup          # First-time setup wizard
  $ agt list           # View open issues
  $ agt config         # Initialize configuration
```

### 3. 이슈 목록 조회

현재 저장소의 모든 오픈 이슈를 조회합니다.

```bash
$ agt list

=== 📋 Open Issues ===

123 Fix login bug [bug]
124 Add dark mode feature [enhancement]
125 Update documentation [documentation]
```

### 4. 이슈 생성

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

### 5. 브랜치 생성

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

### 6. Pull Request 생성

현재 브랜치에서 PR을 자동으로 생성합니다. 템플릿을 지원하며 관련 이슈를 자동으로 연결할 수 있습니다.

```bash
$ agt pr

📍 Enter PR title: Fix login authentication bug

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

### 7. 라벨 생성

GitHub 저장소에 새로운 라벨을 생성합니다.

```bash
$ agt label

🏷 Enter label name: urgent
🎨 Enter label color (6-digit hex, e.g., FFFFFF) [default: FFFFFF]: FF0000
📝 Enter label description (optional): Urgent issues that need immediate attention

⠋ Creating label 'urgent'...
✅ Label 'urgent' has been successfully created.
```

### 8. 저장소 통계

저장소의 포괄적인 통계와 인사이트를 표시합니다.

```bash
$ agt stats

╔════════════════════════════════════════════════╗
║       📊 Repository Statistics                ║
╚════════════════════════════════════════════════╝

Repository: ljlm0402/auto-github-tool

📈 Overview
  ⭐ Stars:          42
  🍴 Forks:          8
  👁️  Watchers:       5
  🐛 Open Issues:    3
  🔓 Open PRs:       1

👥 Contributors
  Total contributors: 5

  Top Contributors:
  • ljlm0402         (245 commits)
  • contributor2     (38 commits)
  • contributor3     (12 commits)

🏷️  Most Used Labels
  • bug              (12 issues)
  • enhancement      (8 issues)
  • documentation    (5 issues)

📊 Issue Statistics
  • Total Issues:    45
  • Open:            3
  • Closed:          42
  • Close Rate:      93.3%

🔀 PR Statistics
  • Total PRs:       38
  • Open:            1
  • Merged:          35
  • Closed:          2
  • Merge Rate:      94.6%
```

**특징:**

- ⚡ **빠른 성능**: 병렬 API 호출 (50-75% 더 빠름)
- 📊 **포괄적인 데이터**: Stars, forks, issues, PRs, 기여자
- 🎯 **스마트 캐싱**: 결과가 5분간 캐시됨
- 🎨 **아름다운 출력**: 컬러 및 포맷팅된 디스플레이

### 프로젝트 기여하기

1. **이슈 생성**

   ```bash
   agt issue
   ```

2. **브랜치 생성**

   ```bash
   agt branch
   ```

3. **변경사항 커밋**

   ```bash
   git add .
   git commit -m "feat: Add new feature"
   ```

4. **PR 생성**
   ```bash
   agt pr
   ```

## 👀 디버그 모드

AGT는 문제 해결을 위한 포괄적인 디버그 모드를 포함하고 있습니다. 활성화하면 콘솔에 상세한 로그를 표시하고 `~/.agt/agt.log`에 기록합니다.

### 디버그 모드 활성화

```bash
# 환경 변수 설정
AGT_DEBUG=true agt branch

# 또는 --debug 플래그 사용
agt branch --debug
```

### 로그 확인

```bash
# 로그 파일 위치 확인
ls ~/.agt/

# 실시간 로그 보기
tail -f ~/.agt/agt.log

# 로그 검색 (macOS/Linux)
grep "ERROR" ~/.agt/agt.log
```

### 로그 레벨

- **INFO**: 작업에 대한 일반 정보
- **DEBUG**: 상세한 디버깅 정보
- **WARN**: 경고 메시지
- **ERROR**: 스택 트레이스가 포함된 오류 메시지

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

   ➡️ 해결: `gh auth login` 실행하여 재인증하거나 `agt setup` 실행

3. **GitHub CLI 미설치**

   ```
   ❌ GitHub CLI is not installed. Please install it: https://cli.github.com/
   ```

   ➡️ 해결: `brew install gh` (macOS) 또는 공식 사이트에서 설치

4. **네트워크 오류**

   ```
   ❌ Network error: Please check your internet connection and try again.
   ```

   ➡️ 해결: AGT는 네트워크 작업을 최대 3회까지 자동으로 재시도합니다. 오류가 계속되면 인터넷 연결을 확인하세요

5. **브랜치가 존재하지 않음**

   ```
   ❌ Source branch 'feature/123-...' does not exist
   ```

   ➡️ 해결: `agt branch`로 브랜치 먼저 생성

6. **커밋이 없는 경우**

   ```
   ❌ No commits found between 'main' and 'feature/123-...'.
   Please commit your changes before creating a PR.
   ```

   ➡️ 해결: 변경사항을 커밋한 후 PR 생성

7. **잘못된 브랜치 이름**
   ```
   ❌ Invalid branch name: Branch names cannot contain shell special characters
   ```
   ➡️ 해결: AGT는 브랜치 이름을 자동으로 정리합니다. 이 오류가 표시되면 이슈 제목에 금지된 문자가 포함되어 있을 수 있습니다

### 🆘 도움 받기

문제가 계속되는 경우:

1. **설정 마법사 실행**: `agt setup`으로 환경 확인
2. **디버그 모드 활성화**: `AGT_DEBUG=true agt <command>`로 상세 로그 확인
3. **로그 확인**: `~/.agt/agt.log`에서 오류 세부 정보 확인
4. **이슈 제보**: 오류 메시지와 로그와 함께 GitHub에 이슈 생성

## 🤝 기여하기

기여는 언제나 환영합니다! 이슈를 열거나 풀 리퀘스트를 제출해 주세요.

## 💳 라이선스

[MIT](LICENSE)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/ljlm0402">AGUMON</a> 🦖
</p>
