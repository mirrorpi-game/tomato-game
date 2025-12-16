# 🚀 GitHub Pages 배포 가이드

## 1. GitHub 레포지토리 설정

### 1.1 레포지토리 생성
1. GitHub에서 새 레포지토리 생성
2. 레포지토리 이름을 `tomatogame`으로 설정 (또는 원하는 이름)

### 1.2 코드 업로드
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tomatogame.git
git push -u origin main
```

## 2. GitHub Pages 설정

### 2.1 Pages 활성화
1. GitHub 레포지토리 → **Settings** 탭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. **Source**를 **GitHub Actions**로 선택

### 2.2 Vite 설정 수정
`vite.config.ts` 파일에서 `base` 경로를 레포지토리 이름에 맞게 수정:

```typescript
export default defineConfig({
  base: '/YOUR_REPOSITORY_NAME/', // 실제 레포지토리 이름으로 변경
  // ...
})
```

## 3. 자동 배포

### 3.1 배포 트리거
- `main` 브랜치에 코드를 푸시하면 자동으로 배포 시작
- GitHub Actions 탭에서 배포 진행 상황 확인 가능

### 3.2 배포 완료 확인
- 배포 완료 후 `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`에서 게임 확인
- 보통 2-5분 정도 소요

## 4. 문제 해결

### 4.1 404 에러
- `vite.config.ts`의 `base` 경로가 올바른지 확인
- 레포지토리 이름과 일치하는지 확인

### 4.2 빌드 실패
- GitHub Actions 탭에서 에러 로그 확인
- 로컬에서 `npm run build` 명령어로 빌드 테스트

### 4.3 캐시 문제
- 브라우저 캐시 삭제 후 새로고침
- 시크릿/프라이빗 모드에서 테스트

## 5. 커스텀 도메인 (선택사항)

### 5.1 도메인 설정
1. `public/CNAME` 파일 생성
2. 파일에 도메인 주소 입력 (예: `game.yourdomain.com`)
3. DNS 설정에서 CNAME 레코드 추가

### 5.2 HTTPS 활성화
- GitHub Pages 설정에서 **Enforce HTTPS** 체크
- 자동으로 SSL 인증서 발급

## 6. 배포 URL

배포 완료 후 다음 URL에서 게임을 플레이할 수 있습니다:

**https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/**

> `YOUR_USERNAME`과 `YOUR_REPOSITORY_NAME`을 실제 값으로 변경하세요.
