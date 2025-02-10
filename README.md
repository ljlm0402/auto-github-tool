## AGT 소개

AGT(Automatic GitHub Tool)는 GitHub Issue를 기반으로 브랜치 관리와 풀 리퀘스트(PR) 생성을 자동화하여 개발자의 생산성을 향상시키고, 브랜치 관리의 일관성을 유지하는 도구입니다.

이 도구를 사용하면 다음과 같은 작업을 빠르게 수행할 수 있습니다:
- **이슈 목록 조회**
- **새 이슈 생성 (제목 입력 가능)**
- **이슈 기반 브랜치 생성**
- **PR 생성**

## 📋 목차
- [사전 준비사항](#사전-준비사항)
- [설치 방법](#설치-방법)
- [명령어](#명령어)
- [동작 예시](#동작-예시)
- [문제 해결](#문제-해결)

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

3. **AGT 오픈소스 설치**
   ```bash
   npm install -g auth-github-tool
   ```
설치 후 agt 명령어를 사용하여 실행할 수 있습니다.

## 🛠 사용법
### 1. 명령어 개요

```sh
agt --help    # 사용 가능한 명령어 목록 출력
agt list      # 오픈된 이슈 목록 조회
agt issue     # 새 이슈 생성 (제목 입력 지원)
agt branch    # 선택한 이슈 기반 브랜치 생성
agt pr        # 현재 브랜치에서 PR 생성
```

### 2. 도움말
```sh
$ agt --help

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
```

### 3. 이슈 목록 조회
현재 저장소의 모든 이슈를 번호 순으로 정렬하여 보여줍니다.
```bash
$ agt list
=== Open Issues ===
#2   [BE] 새로운 게임방을 생성한다.
#4   [BE] 개설된 게임방의 목록을 가져온다.
#8   [FE] 게임방 컴포넌트 생성
#9   [BE] 닉네임을 설정한다
```

### 3. 이슈 생성
신규 이슈 생성합니다.
```bash
$ agt issue
> 📝 Enter issue title: <Input>
📌 Available Issue Templates:
1. bug_report.md
2. feature_request.md
3. question.md
> Select a template number or press Enter to skip: <Input>
> 🏷 Enter labels (comma-separated, or press Enter to skip): <Input>
> 👥 Enter assignees (comma-separated, or press Enter to skip): <Input>
> 📅 Enter milestone (or press Enter to skip): <Input>
```

### 🌿 `agt branch`
이슈 번호를 입력받아 해당 이슈의 제목을 기반으로 새로운 브랜치를 생성합니다.
- 브랜치 명명 규칙: `feature-{fe/be}-#{issue-number}`
- 소스 브랜치:
  - FE 이슈: `dev-fe`
  - BE 이슈: `dev-be`

```bash
$ agt branch
=== Open Issues ===
#2   [BE] 새로운 게임방을 생성한다.
#4   [BE] 개설된 게임방의 목록을 가져온다.
#8   [FE] 게임방 컴포넌트 생성
#9   [BE] 닉네임을 설정한다
Select issue number: 2
Creating and switching to branch: feature-be-#2 from dev-be
Successfully created and switched to branch: feature-be-#2
```

### 🔀 `agt pr`
현재 feature 브랜치에서 PR을 자동으로 생성합니다.
- PR 제목은 이슈 제목과 동일하게 설정됩니다.
- Reviewer는 CODEOWNERS 파일에서 본인을 제외한 모든 사람으로 설정됩니다.
- Assignees는 본인으로 설정됩니다.
- PR 템플릿이 자동으로 적용되며 이슈 번호가 자동 입력됩니다.

```bash
$ agt pr
Creating PR with title: [BE] 새로운 게임방을 생성한다.
Base branch: dev-be
Reviewers: @reviewer1,@reviewer2
Successfully created PR for issue #2
```

## 문제 해결

### ❌ 일반적인 오류

1. **Git 저장소가 아닌 경우**
   ```
   Error: Not a git repository. Please run 'git init' first.
   ```
   ➡️ 해결: `git init` 명령어로 Git 저장소 초기화

2. **GitHub CLI 인증 오류**
   ```
   Error: Please run 'gh auth login' to authenticate with GitHub.
   ```
   ➡️ 해결: `gh auth login` 실행하여 재인증

3. **잘못된 이슈 제목 형식**
   ```
   Error: Issue title must start with [FE] or [BE]
   ```
   ➡️ 해결: 이슈 제목 형식을 `[FE]` 또는 `[BE]`로 시작하도록 수정

4. **소스 브랜치가 없는 경우**
   ```
   Error: Source branch 'dev-fe' does not exist
   ```
   ➡️ 해결: 해당하는 dev-fe 또는 dev-be 브랜치가 존재하는지 확인

5. **feature 브랜치가 아닌 곳에서 PR 생성 시도**
   ```
   Error: Current branch is not a feature branch
   ```
   ➡️ 해결: feature-fe-#번호 또는 feature-be-#번호 형식의 브랜치에서만 PR 생성 가능

## 📄 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.