import { Tomato } from './Tomato.js';
import { findNonOverlappingPosition, distance } from './physics.js';

// 게임 설정
export interface GameConfig {
  initialCountPerNumber: number;
  initialZeroCount: number; // 0(사과)의 초기 개수
  startShots: number;
  tomatoRadius: number;
  baseRange: number;
  rangePerValue: number;
  moveSpeed: number; // px/sec
  targetTotal: number; // 총 토마토 개수 유지
  // 게임 영역 여백 (광고/랭킹 공간)
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const defaultConfig: GameConfig = {
  initialCountPerNumber: 6,
  initialZeroCount: 10, // 0(사과)는 10개로 시작
  startShots: 5,
  tomatoRadius: 15,  // 18 -> 15로 축소
  baseRange: 50,     // 100 -> 50으로 절반 축소
  rangePerValue: 10, // 20 -> 10으로 절반 축소
  moveSpeed: 900,
  targetTotal: 64, // 0은 10개, 1~9는 각각 6개씩 (총 64개)
  // 게임 영역 여백 설정 (적당한 크기로 조정)
  margin: {
    top: 80,     // 상단 여백 (광고 공간)
    bottom: 120, // 하단 여백 (랭킹 공간)
    left: 50,    // 좌측 여백
    right: 50    // 우측 여백
  }
};

// 초기 토마토들 생성 (0~9 각각 동일 개수) - 게임 영역 내에서만
export function createInitialTomatoes(
  config: GameConfig,
  worldWidth: number,
  worldHeight: number
): Tomato[] {
  const tomatoes: Tomato[] = [];
  
  // 게임 영역 크기 계산 (여백 제외)
  const gameAreaWidth = worldWidth - config.margin.left - config.margin.right;
  const gameAreaHeight = worldHeight - config.margin.top - config.margin.bottom;
  
  // 0~9 각 숫자별로 지정된 개수만큼 생성
  for (let value = 0; value <= 9; value++) {
    const count = value === 0 ? config.initialZeroCount : config.initialCountPerNumber;
    for (let i = 0; i < count; i++) {
      const position = findNonOverlappingPositionInGameArea(
        tomatoes,
        config.tomatoRadius,
        gameAreaWidth,
        gameAreaHeight,
        config.margin
      );
      
      if (position) {
        tomatoes.push(new Tomato(position.x, position.y, value, config.tomatoRadius));
      } else {
        console.warn(`토마토 ${value} 생성 실패: 겹치지 않는 위치를 찾을 수 없음`);
      }
    }
  }
  
  return tomatoes;
}

// 게임 영역 내에서만 겹치지 않는 랜덤 위치 생성
export function findNonOverlappingPositionInGameArea(
  existingTomatoes: Tomato[],
  radius: number,
  gameAreaWidth: number,
  gameAreaHeight: number,
  margin: { top: number; bottom: number; left: number; right: number },
  maxAttempts: number = 100
): { x: number; y: number } | null {
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 게임 영역 내에서만 랜덤 위치 생성 (여백 고려)
    const x = margin.left + radius + Math.random() * (gameAreaWidth - 2 * radius);
    const y = margin.top + radius + Math.random() * (gameAreaHeight - 2 * radius);
    
    let overlapping = false;
    for (const tomato of existingTomatoes) {
      if (distance(x, y, tomato.x, tomato.y) < radius + tomato.radius + 5) { // 5px 여백
        overlapping = true;
        break;
      }
    }
    
    if (!overlapping) {
      return { x, y };
    }
  }
  
  return null; // 적절한 위치를 찾지 못함
}

// 랜덤 값(1~9)의 토마토 1개 생성 - 게임 영역 내에서만
export function createRandomTomato(
  existingTomatoes: Tomato[],
  config: GameConfig,
  worldWidth: number,
  worldHeight: number
): Tomato | null {
  const value = Math.floor(Math.random() * 10); // 0~9
  
  // 게임 영역 크기 계산 (여백 제외)
  const gameAreaWidth = worldWidth - config.margin.left - config.margin.right;
  const gameAreaHeight = worldHeight - config.margin.top - config.margin.bottom;
  
  const position = findNonOverlappingPositionInGameArea(
    existingTomatoes,
    config.tomatoRadius,
    gameAreaWidth,
    gameAreaHeight,
    config.margin
  );
  
  if (position) {
    return new Tomato(position.x, position.y, value, config.tomatoRadius);
  }
  
  return null;
}

// 지정된 값의 토마토 1개 생성 - 게임 영역 내에서만
export function createTomatoWithValue(
  value: number,
  existingTomatoes: Tomato[],
  config: GameConfig,
  worldWidth: number,
  worldHeight: number
): Tomato | null {
  // 게임 영역 크기 계산 (여백 제외)
  const gameAreaWidth = worldWidth - config.margin.left - config.margin.right;
  const gameAreaHeight = worldHeight - config.margin.top - config.margin.bottom;
  
  const position = findNonOverlappingPositionInGameArea(
    existingTomatoes,
    config.tomatoRadius,
    gameAreaWidth,
    gameAreaHeight,
    config.margin
  );
  
  if (position) {
    return new Tomato(position.x, position.y, value, config.tomatoRadius);
  }
  
  return null;
}

// 토마토 총 개수를 targetTotal로 맞추기 (부족하면 랜덤 생성으로 채움)
export function maintainTotalCount(
  tomatoes: Tomato[],
  config: GameConfig,
  canvasWidth: number,
  canvasHeight: number
): void {
  while (tomatoes.length < config.targetTotal) {
    const newTomato = createRandomTomato(tomatoes, config, canvasWidth, canvasHeight);
    if (newTomato) {
      tomatoes.push(newTomato);
    } else {
      console.warn('더 이상 토마토를 생성할 수 없음: 공간 부족');
      break;
    }
  }
}
