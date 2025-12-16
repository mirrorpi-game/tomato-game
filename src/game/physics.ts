import { Tomato } from './Tomato.js';

// 두 점 사이의 거리 계산
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// 원-원 충돌 검사
export function circleCollision(tomato1: Tomato, tomato2: Tomato): boolean {
  const dist = distance(tomato1.x, tomato1.y, tomato2.x, tomato2.y);
  return dist < (tomato1.radius + tomato2.radius);
}

// 이동 중인 토마토와 충돌하는 모든 토마토 찾기
export function findCollisions(movingTomato: Tomato, allTomatoes: Tomato[]): Tomato[] {
  const collisions: Tomato[] = [];
  
  for (const tomato of allTomatoes) {
    if (tomato === movingTomato) continue;
    if (tomato.isMoving) continue; // 정지된 토마토와만 충돌
    
    if (circleCollision(movingTomato, tomato)) {
      collisions.push(tomato);
    }
  }
  
  return collisions;
}

// 겹치지 않는 랜덤 위치 생성 (월드 좌표계)
export function findNonOverlappingPosition(
  existingTomatoes: Tomato[],
  radius: number,
  worldWidth: number,
  worldHeight: number,
  maxAttempts: number = 100
): { x: number; y: number } | null {
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 월드 영역 내에서 랜덤 위치 생성
    const x = radius + Math.random() * (worldWidth - 2 * radius);
    const y = radius + Math.random() * (worldHeight - 2 * radius);
    
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
