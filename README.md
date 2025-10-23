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
  <strong>· English <a href="./README.ko.md">· Korean</a></strong>
</p>

---

## Introduction

AGT (Auto GitHub Tool) is a CLI tool that automates branch management and pull request creation based on GitHub Issues, improving developer productivity and maintaining consistency in branch management.

### ✨ Key Features

- **🎯 Interactive Menu Mode**: Easy access to all features through an intuitive menu
- **📋 Issue Management**: View issue lists and create issues using templates
- **🌿 Branch Automation**: Automatically create issue-based branches (feature/bugfix/hotfix/release)
- **🔀 PR Creation**: Automatically create pull requests using templates
- **🏷️ Label Management**: Create and manage GitHub labels
- **⚙️ Configuration File**: Support for project-specific or global settings (.agtrc.json)
- **🪄 Setup Wizard**: Interactive 5-step setup wizard for easy first-time configuration
- **🎨 Enhanced UX**: Better user experience with colored output, spinners, and input validation
- **📊 Logging System**: Comprehensive logging to `~/.agt/agt.log` for debugging and tracking
- **⚡ Smart Caching**: Automatic caching of GitHub API responses for improved performance
- **🔄 Error Recovery**: Unified error handling system with automatic retry mechanism
- **✅ Input Validation**: Multi-layer security validation to prevent shell injection
- **📈 Performance**: Parallel API operations for 50-75% faster command execution

## 📋 Table of Contents

- [Requirements](#-requirements)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
  - [Interactive Mode](#interactive-mode-recommended)
  - [Direct Commands](#direct-commands)
  - [Configuration File](#configuration-file)
- [Command Guide](#-command-guide)
  - [Setup Wizard](#1-setup-wizard)
  - [Help](#2-help)
  - [List Issues](#3-list-issues)
  - [Create Issue](#4-create-issue)
  - [Create Branch](#5-create-branch)
  - [Create Pull Request](#6-create-pull-request)
  - [Create Label](#7-create-label)
  - [Statistics](#8-statistics)
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

## 🚀 Quick Start

The easiest way to get started with AGT is using the setup wizard:

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
agt setup     # Run setup wizard (first-time users)
agt list      # View open issues
agt issue     # Create a new issue
agt branch    # Create a branch from an issue
agt pr        # Create a PR from current branch
agt label     # Create a label
agt stats     # Show repository statistics
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

### 1. Setup Wizard

Interactive setup wizard to help you configure AGT for the first time.

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

**What it does:**

1. **Git Check**: Verifies Git is installed and accessible
2. **GitHub CLI Check**: Verifies GitHub CLI (gh) is installed
3. **Authentication**: Checks if you're authenticated with GitHub
4. **Connection Test**: Tests GitHub API connectivity
5. **Configuration**: Optionally create local or global config (can be skipped)

**Features:**

- ✅ Sequential validation with helpful error messages
- 🔄 Interactive recovery options for failed steps
- ⏭️ Skip configuration if you prefer default settings
- 📊 Detailed summary at the end

### 2. Help

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

### 3. List Issues

View all open issues in the current repository.

```bash
$ agt list

=== 📋 Open Issues ===

123 Fix login bug [bug]
124 Add dark mode feature [enhancement]
125 Update documentation [documentation]
```

### 4. Create Issue

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

### 5. Create Branch

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

### 6. Create Pull Request

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

### 7. Create Label

Create a new label in the GitHub repository.

```bash
$ agt label

🏷 Enter label name: urgent
🎨 Enter label color (6-digit hex, e.g., FFFFFF) [default: FFFFFF]: FF0000
📝 Enter label description (optional): Urgent issues that need immediate attention

⠋ Creating label 'urgent'...
✅ Label 'urgent' has been successfully created.
```

### 8. Statistics

Display comprehensive repository statistics and insights.

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

**Features:**

- ⚡ **Fast Performance**: Parallel API calls (50-75% faster)
- 📊 **Comprehensive Data**: Stars, forks, issues, PRs, contributors
- 🎯 **Smart Caching**: Results cached for 5 minutes
- 🎨 **Beautiful Output**: Colored and formatted display

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

## 👀 Debug Mode

AGT includes a comprehensive debug mode for troubleshooting issues. When enabled, it shows detailed logs in the console and records them to `~/.agt/agt.log`.

### Enable Debug Mode

```bash
# Set environment variable
AGT_DEBUG=true agt branch

# Or use the --debug flag
agt branch --debug
```

### View Logs

```bash
# View log file location
ls ~/.agt/

# Tail logs in real-time
tail -f ~/.agt/agt.log

# Search logs (macOS/Linux)
grep "ERROR" ~/.agt/agt.log
```

### Log Levels

- **INFO**: General information about operations
- **DEBUG**: Detailed debugging information
- **WARN**: Warning messages
- **ERROR**: Error messages with stack traces

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

   ➡️ Solution: Re-authenticate with `gh auth login` or run `agt setup`

3. **GitHub CLI not installed**

   ```
   ❌ GitHub CLI is not installed. Please install it: https://cli.github.com/
   ```

   ➡️ Solution: Install with `brew install gh` (macOS) or from the official website

4. **Network errors**

   ```
   ❌ Network error: Please check your internet connection and try again.
   ```

   ➡️ Solution: AGT automatically retries network operations up to 3 times. If the error persists, check your internet connection

5. **Branch does not exist**

   ```
   ❌ Source branch 'feature/123-...' does not exist
   ```

   ➡️ Solution: Create the branch first with `agt branch`

6. **No commits**

   ```
   ❌ No commits found between 'main' and 'feature/123-...'.
   Please commit your changes before creating a PR.
   ```

   ➡️ Solution: Commit your changes before creating a PR

7. **Invalid branch name**
   ```
   ❌ Invalid branch name: Branch names cannot contain shell special characters
   ```
   ➡️ Solution: AGT automatically sanitizes branch names. If you see this error, the issue title may contain forbidden characters

### 🆘 Getting Help

If you're still experiencing issues:

1. **Run setup wizard**: `agt setup` to verify your environment
2. **Enable debug mode**: `AGT_DEBUG=true agt <command>` for detailed logs
3. **Check logs**: View `~/.agt/agt.log` for error details
4. **Report issue**: Create an issue on GitHub with the error message and logs

## 🤝 Contributing

Contributions are always welcome! Please feel free to open an issue or submit a pull request.

## 💳 License

[MIT](LICENSE)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/ljlm0402">AGUMON</a> 🦖
</p>
