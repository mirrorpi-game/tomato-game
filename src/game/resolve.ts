import { Tomato } from './Tomato.js';
import { GameConfig, createTomatoWithValue } from './spawn.js';

export interface ResolveResult {
  scoreGained: number;
  shotsGained: number;
}

// 위치를 게임 영역 내로 조정 (여백 제외)
function adjustPositionToGameArea(
  x: number, 
  y: number, 
  config: GameConfig, 
  worldWidth: number, 
  worldHeight: number
): { x: number; y: number } {
  const radius = config.tomatoRadius;
  const margin = config.margin;
  
  // 게임 영역 경계 계산 (여백 제외)
  const minX = margin.left + radius;
  const maxX = worldWidth - margin.right - radius;
  const minY = margin.top + radius;
  const maxY = worldHeight - margin.bottom - radius;
  
  // 위치 조정
  const adjustedX = Math.max(minX, Math.min(maxX, x));
  const adjustedY = Math.max(minY, Math.min(maxY, y));
  
  return { x: adjustedX, y: adjustedY };
}

// 충돌 후 합성 규칙 적용
export function resolveCollision(
  movingTomato: Tomato,
  hitTomatoes: Tomato[],
  allTomatoes: Tomato[],
  config: GameConfig,
  worldWidth: number,
  worldHeight: number
): ResolveResult {
  
  // 참여 토마토들의 값 합계 계산
  const sum = movingTomato.value + hitTomatoes.reduce((acc, t) => acc + t.value, 0);
  const participantCount = 1 + hitTomatoes.length; // 이동 토마토 + 충돌된 토마토들
  
  let scoreGained = 0;
  let shotsGained = 0;
  
  // 사라질 토마토들의 숫자 기록 (재생성용)
  const removedValues = [movingTomato.value, ...hitTomatoes.map(t => t.value)];
  
  // 참여 토마토들을 배열에서 제거
  const toRemove = [movingTomato, ...hitTomatoes];
  for (const tomato of toRemove) {
    const index = allTomatoes.indexOf(tomato);
    if (index !== -1) {
      allTomatoes.splice(index, 1);
    }
  }
  
  // 새로운 합성 규칙 적용
  if (sum === 10) {
    // sum==10: 사라진 토마토들을 그대로 랜덤 위치에 재생성
    scoreGained = participantCount; // 10이 되면 점수 획득
    shotsGained = 2;
    
    // 사라진 토마토들을 동일한 숫자로 랜덤 위치에 재생성
    for (const value of removedValues) {
      const newTomato = createTomatoWithValue(value, allTomatoes, config, worldWidth, worldHeight);
      if (newTomato) {
        allTomatoes.push(newTomato);
      }
    }
  } else {
    // sum!=10: 결과 토마토 생성 + 합이 10이 되는 토마토 생성
    scoreGained = 0; // 10이 아니면 점수 없음
    shotsGained = -1; // 10이 아니면 추가로 -1 페널티 (총 -2가 됨)
    
    let resultValue: number;
    
    if (sum < 10) {
      // sum<10: 결과는 sum 값
      resultValue = sum;
    } else {
      // sum>10: 결과는 1의 자리 (sum%10)
      resultValue = sum % 10;
      // 토마토 값이 1~9이므로 sum%10이 0이 되는 경우는 없음 (최대 합은 9+9=18)
    }
    
    // 충돌 위치에 결과 토마토 생성
    const adjustedPos = adjustPositionToGameArea(
      movingTomato.x, 
      movingTomato.y, 
      config, 
      worldWidth, 
      worldHeight
    );
    
    const resultTomato = new Tomato(adjustedPos.x, adjustedPos.y, resultValue, config.tomatoRadius);
    allTomatoes.push(resultTomato);
    
    // 결과 토마토와 합이 10이 되는 토마토를 랜덤 위치에 생성
    const complementValue = 10 - resultValue;
    if (complementValue > 0 && complementValue <= 10) { // 10도 포함 (0의 보완값)
      // complementValue가 10이면 0으로 변경
      const actualComplementValue = complementValue === 10 ? 0 : complementValue;
      const complementTomato = createTomatoWithValue(actualComplementValue, allTomatoes, config, worldWidth, worldHeight);
      if (complementTomato) {
        allTomatoes.push(complementTomato);
      }
    }
    
    // 실패 시 추가로 0(사과) 생성 (방해요소 증가)
    const appleTomato = createTomatoWithValue(0, allTomatoes, config, worldWidth, worldHeight);
    if (appleTomato) {
      allTomatoes.push(appleTomato);
    }
  }
  
  return { scoreGained, shotsGained };
}
