## AGT 소개

AGT(Automatic Git & GitHub Tool)는 GitHub Issue를 기반으로 브랜치 관리와 풀 리퀘스트(PR) 생성을 자동화하여 개발자의 생산성을 향상시키고, 브랜치 관리의 일관성을 유지하는 도구입니다.

## AGT 개발 배경

<details>
<summary>AGT 개발 배경 자세히 보기</summary>

### AGT를 개발하게 된 계기

프로젝트의 브랜치 전략을 효율적으로 관리하고, 반복적인 Git 및 GitHub 작업을 자동화하기 위해 AGT를 개발하게 되었습니다. 특히, 이슈 기반 브랜치 생성과 PR 생성을 자동화함으로써 개발자의 생산성을 높이고, 브랜치 관리의 일관성을 유지하고자 했습니다.

### AGT 개발을 위해 학습한 내용 정리

AGT를 개발하기 위해 다음과 같은 기술과 도구에 대해 학습하였습니다:

#### Git

- **브랜치 관리**: Git의 브랜치 생성, 전환, 병합 등의 기본적인 명령어 사용법을 익혔습니다.
- **리베이스 및 머지 전략**: 브랜치 전략에 맞는 적절한 병합 방법을 선택하고 적용하는 방법을 학습했습니다.
- **스크립트 내 Git 명령어 활용**: 스크립트에서 Git 명령어를 활용하여 자동화된 작업을 수행하는 방법을 익혔습니다.

#### GitHub CLI (gh)

- **설치 및 설정**: GitHub CLI를 설치하고 인증하는 방법을 학습했습니다.
- **이슈 관리**: `gh issue` 명령어를 사용하여 이슈 목록 조회, 이슈 정보 가져오기 등의 기능을 구현했습니다.
- **PR 관리**: `gh pr` 명령어를 사용하여 PR 생성, PR 상태 확인 등의 작업을 자동화했습니다.
- **API 활용**: `gh api` 명령어를 통해 GitHub API를 호출하여 추가적인 데이터를 가져오거나 작업을 수행하는 방법을 익혔습니다.

#### GitHub Actions

- **워크플로우 작성**: YAML 파일을 작성하여 특정 이벤트에 대한 자동화된 작업을 정의하는 방법을 학습했습니다.
- **이벤트 트리거**: PR 머지 시 이슈를 자동으로 클로즈하는 워크플로우를 구현하기 위해 `pull_request_target` 이벤트와 조건문을 활용했습니다.
- **권한 설정**: 워크플로우에서 필요한 권한을 설정하여 안전하게 작업을 수행할 수 있도록 했습니다.
- **비밀 관리**: `GITHUB_TOKEN`과 같은 시크릿을 활용하여 워크플로우에서 안전하게 인증 정보를 사용했습니다.
- **스크립트 통합**: 워크플로우 내에서 Bash 스크립트를 실행하여 복잡한 작업을 자동화했습니다.

GitHub Actions의 사용은 AGT 스크립트와 통합되어 이슈와 PR 간의 자동 연결 및 관리를 가능하게 했습니다. 특히, PR이 머지될 때 관련 이슈를 자동으로 클로즈하는 기능을 구현하기 위해 GitHub Actions를 활용했습니다.

### 발생했던 문제

AGT 개발 과정에서 몇 가지 문제가 발생하였습니다:

- **이슈와 PR 연결 문제**: 웹 인터페이스를 통해서는 이슈를 PR에 쉽게 연결할 수 있었으나, GitHub CLI(`gh`)를 사용하여 동일한 작업을 수행하려고 할 때 어려움이 있었습니다. 특히, 자동으로 이슈를 클로즈하는 기능을 CLI로 구현하는 데 한계가 있었습니다.

- **모노레포 제한**: 프로젝트가 모노레포 구조를 가지고 있어, 특정 키워드(예: `Close`)를 사용하여 이슈를 자동으로 클로즈하는 것이 어려웠습니다. 이는 여러 패키지가 하나의 리포지토리에 포함되어 있기 때문에, 특정 패키지의 이슈를 클로즈하는 데 제약이 있었습니다.

- **GitHub Actions 의존성**: 이러한 문제를 해결하기 위해, 결국 GitHub Actions를 사용하여 PR 머지 시 이슈를 자동으로 클로즈하는 워크플로우를 작성해야 했습니다. 이는 스크립트 내에서 모든 기능을 구현하는 대신, GitHub Actions의 자동화 기능을 활용하여 문제를 우회하는 방법이었습니다.

이러한 문제들을 해결하기 위해 AGT는 GitHub Actions와의 연동을 강화하여, 보다 안정적이고 자동화된 워크플로우를 제공하게 되었습니다.

</details>


## 📋 목차
- [사전 준비사항](#사전-준비사항)
- [설치 방법](#설치-방법)
  - [MacOS](#-macos)
  - [Windows](#-windows)
- [명령어](#명령어)
- [동작 예시](#동작-예시)
- [문제 해결](#문제-해결)

## 사전 준비사항
- Git이 설치되어 있어야 합니다
- GitHub 계정이 필요합니다.
- `.github/pull_request_template.md` 파일이 설정되어 있어야 합니다

## 설치 방법

### 🍎 MacOS

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
   # AGT 스크립트를 위한 디렉터리 생성
   npm i -g auth-github-tool
   ```

## 명령어

### 🔍 `agt list`
현재 저장소의 모든 이슈를 번호 순으로 정렬하여 보여줍니다.
```bash
$ agt list
=== Open Issues ===
#2   [BE] 새로운 게임방을 생성한다.
#4   [BE] 개설된 게임방의 목록을 가져온다.
#8   [FE] 게임방 컴포넌트 생성
#9   [BE] 닉네임을 설정한다
```
### 📌 `agt issue`
이슈 생성합니다.

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
