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

<p align="center">
  <a href="./README.ko.md">한국어</a> •
  <a href="./README.md">English</a>
</p>

<br />

## Introduction

AGT (Auto GitHub Tool) is a CLI tool that automates branch management and pull request creation based on GitHub Issues, improving developer productivity and maintaining consistency in branch management.

### ✨ Key Features

- **🎯 Interactive Menu Mode**: Easy access to all features through an intuitive menu
- **📋 Issue Management**: View issue lists and create issues using templates
- **🌿 Branch Automation**: Automatically create issue-based branches (feature/bugfix/hotfix/release)
- **🔀 PR Creation**: Automatically create pull requests using templates
- **🏷️ Label Management**: Create and manage GitHub labels
- **⚙️ Configuration File**: Support for project-specific or global settings (.agtrc.json)
- **🎨 Enhanced UX**: Better user experience with colored output, spinners, and input validation

## 📋 Table of Contents

- [Requirements](#-requirements)
- [Installation](#-installation)
- [Usage](#-usage)
  - [Interactive Mode](#interactive-mode-recommended)
  - [Direct Commands](#direct-commands)
  - [Configuration File](#configuration-file)
- [Command Guide](#-command-guide)
  - [Help](#1-help)
  - [List Issues](#2-list-issues)
  - [Create Issue](#3-create-issue)
  - [Create Branch](#4-create-branch)
  - [Create Pull Request](#5-create-pull-request)
  - [Create Label](#6-create-label)
- [Project Structure](#-project-structure)
- [Developer Guide](#-developer-guide)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 📌 Requirements

- Node.js 14 or higher
- GitHub CLI (gh) installation required
- GitHub account

```sh
node -v # Check version
gh --version  # Check installation
```

## 🚀 Installation

1. **Install GitHub CLI**

   ```bash
   # Install via Homebrew (macOS)
   brew install gh

   # Other platforms: https://cli.github.com/
   ```

2. **Authenticate GitHub Account**

   ```bash
   gh auth login
   ```

   Follow the prompts:

   1. `? What account do you want to log into?` → Select `GitHub.com`
   2. `? What is your preferred protocol for Git operations?` → Select `HTTPS`
   3. `? Authenticate Git with your GitHub credentials?` → Select `Yes`
   4. `? How would you like to authenticate GitHub CLI?` → Select `Login with a web browser`
   5. Copy the one-time code displayed
   6. Log in to GitHub in the automatically opened browser
   7. Enter the copied code to complete authentication

3. **Install AGT**

   ```bash
   npm install -g auto-github-tool
   ```

   After installation, you can use the `agt` command.

## 🛠 Usage

### Interactive Mode (Recommended)

The easiest way to use AGT. Simply type `agt` without any command to display the interactive menu:

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

### Direct Commands

You can directly execute specific tasks by entering commands:

```bash
agt help      # Show available commands
agt list      # View open issues
agt issue     # Create a new issue
agt branch    # Create a branch from an issue
agt pr        # Create a PR from current branch
agt label     # Create a label
agt config    # Initialize configuration
```

### Configuration File

AGT supports project-specific or global configuration.

#### Initialize Configuration

```bash
# Local project configuration (.agtrc.json)
$ agt config

# Global configuration (~/.agtrc.json)
$ agt config --global
```

#### Configuration File Example (.agtrc.json)

The project includes a `.agtrc.example.json` file. Copy it to use:

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

**Configuration Options:**

- `defaultBaseBranch`: Default base branch when creating PRs
- `branchTypes`: Define branch types
- `autoAssign`: Automatically assign yourself
- `defaultLabels`: Default labels to apply
- `autoTemplates`: Automatically use templates

## 📚 Command Guide

### 1. Help

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

### 2. List Issues

View all open issues in the current repository.

```bash
$ agt list

=== 📋 Open Issues ===

123 Fix login bug [bug]
124 Add dark mode feature [enhancement]
125 Update documentation [documentation]
```

### 3. Create Issue

Create issues using templates.

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

### 4. Create Branch

Automatically create a branch by selecting an issue number.

**Branch Naming Convention:** `{type}/{issue-number}-{sanitized-title}`

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

### 5. Create Pull Request

Automatically create a PR from the current branch. Supports templates and can automatically link related issues.

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

### 6. Create Label

Create a new label in the GitHub repository.

```bash
$ agt label

🏷 Enter label name: urgent
🎨 Enter label color (6-digit hex, e.g., FFFFFF) [default: FFFFFF]: FF0000
📝 Enter label description (optional): Urgent issues that need immediate attention

⠋ Creating label 'urgent'...
✅ Label 'urgent' has been successfully created.
```

## 📁 Project Structure

```
auto-github-tool/
├── bin/
│   └── agt.js               # CLI entry point and main logic
├── src/
│   ├── commands/            # Command modules
│   │   ├── menu.js         # Interactive menu
│   │   ├── list.js         # List issues
│   │   ├── issue.js        # Create issue
│   │   ├── branch.js       # Create branch
│   │   ├── pr.js           # Create PR
│   │   └── label.js        # Create label
│   ├── utils/               # Utility functions
│   │   ├── git.js          # Git operations
│   │   ├── github.js       # GitHub CLI integration
│   │   ├── validator.js    # Input validation
│   │   └── config.js       # Configuration management
│   └── templates/           # Template handling
│       └── index.js
├── .agtrc.json             # Project configuration (optional)
├── package.json
└── README.md
```

## 🔧 Developer Guide

### Local Development

```bash
# Clone repository
git clone https://github.com/ljlm0402/auto-github-tool.git
cd auto-github-tool

# Install dependencies
npm install

# Test locally
node bin/agt.js

# Or link globally
npm link
agt
```

### Contributing to the Project

1. **Create an issue**

   ```bash
   agt issue
   ```

2. **Create a branch**

   ```bash
   agt branch
   ```

3. **Make changes and commit**

   ```bash
   git add .
   git commit -m "feat: Add new feature"
   ```

4. **Create a PR**
   ```bash
   agt pr
   ```

## 🔍 Troubleshooting

### ❌ Common Errors

1. **Not a Git repository**

   ```
   ❌ This is not a Git repository. Please run 'git init' first.
   ```

   ➡️ Solution: Initialize Git repository with `git init`

2. **GitHub CLI authentication error**

   ```
   ❌ GitHub authentication failed. Please run 'gh auth login' first.
   ```

   ➡️ Solution: Re-authenticate with `gh auth login`

3. **GitHub CLI not installed**

   ```
   ❌ GitHub CLI is not installed. Please install it: https://cli.github.com/
   ```

   ➡️ Solution: Install with `brew install gh` (macOS) or from the official website

4. **Branch does not exist**

   ```
   ❌ Source branch 'feature/123-...' does not exist
   ```

   ➡️ Solution: Create the branch first with `agt branch`

5. **No commits**
   ```
   ❌ No commits found between 'main' and 'feature/123-...'.
   Please commit your changes before creating a PR.
   ```
   ➡️ Solution: Commit your changes before creating a PR

## 🤝 Contributing

Contributions are always welcome! Please follow these steps:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

Or you can automate your workflow using `agt`! 😉

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/ljlm0402">AGUMON</a> 🦖
</p>
