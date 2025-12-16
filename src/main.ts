import { Game } from './game/Game.js';

// Canvas 설정 - 고정된 게임 해상도 사용
function setupCanvas(): HTMLCanvasElement {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  
  // 고정된 게임 해상도
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const dpr = window.devicePixelRatio || 1;
  
  function resizeCanvas() {
    // 캔버스 크기를 고정된 게임 해상도로 설정
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    
    // CSS 크기도 고정
    canvas.style.width = GAME_WIDTH + 'px';
    canvas.style.height = GAME_HEIGHT + 'px';
    
    // 화면 중앙에 배치
    canvas.style.position = 'absolute';
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    
    // 컨텍스트 스케일 조정
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    // 게임 로직에서 사용할 고정된 크기
    (canvas as any).logicalWidth = GAME_WIDTH;
    (canvas as any).logicalHeight = GAME_HEIGHT;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  return canvas;
}

// 게임 시작
function main() {
  const canvas = setupCanvas();
  const game = new Game(canvas);
  game.start();
}

// DOM 로드 완료 후 게임 시작
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
