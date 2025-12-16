# 🍅 토마토 숫자 게임

HTML5 Canvas + TypeScript로 만든 웹 미니게임입니다.

## 🎮 플레이하기

**[게임 플레이 (GitHub Pages)](https://YOUR_USERNAME.github.io/tomatogame/)**

> 위 링크에서 YOUR_USERNAME을 실제 GitHub 사용자명으로 변경하세요.

## 게임 규칙

1. **목표**: 토마토 숫자(1~9)를 드래그로 360도 방향 발사하여 충돌 시 합성 규칙을 적용하는 게임
2. **조작**:
   - 토마토 클릭으로 선택
   - 드래그로 방향/거리 결정 (거리 제한 있음)
   - 마우스 놓으면 발사 (샷 1 감소)
3. **합성 규칙**:
   - 합계가 10이면: 모든 토마토 제거, 샷 +2
   - 합계가 10 미만이면: 합계값 토마토 1개 + 랜덤 토마토 1개 생성
   - 합계가 10 초과이면: (합계%10)값 토마토 1개 + 랜덤 토마토 1개 생성
4. **점수**: 없어진 토마토 개수가 점수
5. **게임오버**: 샷이 0이 되면 게임 종료

## 🚀 배포

이 프로젝트는 GitHub Actions를 통해 자동으로 GitHub Pages에 배포됩니다.

### 자동 배포
- `main` 브랜치에 푸시하면 자동으로 빌드 및 배포
- GitHub Actions 워크플로우가 자동 실행
- 빌드 완료 후 GitHub Pages에서 확인 가능

### 수동 배포 (선택사항)
```bash
# gh-pages 패키지 설치 (한 번만)
npm install -g gh-pages

# 배포 실행
npm run deploy
```

## 🛠️ 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 프로젝트 구조

```
src/
├── main.ts              # 엔트리 포인트
├── game/
│   ├── Game.ts          # 게임 루프/상태 관리
│   ├── Tomato.ts        # 토마토 엔티티
│   ├── spawn.ts         # 랜덤 생성/겹침 방지
│   ├── physics.ts       # 거리/원-원 충돌
│   └── resolve.ts       # 충돌 후 합성 규칙
└── ui/
    └── HUD.ts           # 점수/샷 표시, 에임 라인
```

## 기술 스택

- **Vite**: 빌드 도구
- **TypeScript**: 타입 안전성
- **HTML5 Canvas**: 렌더링
- **DPR 스케일링**: 레티나 디스플레이 지원
