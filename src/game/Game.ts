import { Tomato } from './Tomato.js';
import { HUD } from '../ui/HUD.js';
import { GameConfig, defaultConfig, createInitialTomatoes, createTomatoWithValue } from './spawn.js';
import { findCollisions } from './physics.js';
import { resolveCollision } from './resolve.js';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hud: HUD;
  private config: GameConfig;
  
  // 게임 상태
  private tomatoes: Tomato[] = [];
  private score: number = 0;
  private shotsLeft: number = 0;
  private isGameOver: boolean = false;
  private gameStarted: boolean = false;
  
  // 타이머 관련
  private gameTimeLimit: number = 60; // 60초 제한
  private remainingTime: number = 60;
  private gameStartTime: number = 0;
  
  // 입력 상태
  private selectedTomato: Tomato | null = null;
  private isAiming: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private launchedTomatoes: Set<Tomato> = new Set(); // 발사된 토마토 추적
  
  // 게임 루프
  private lastTime: number = 0;
  private animationId: number = 0;
  
  // 화면 크기 추적 (리사이즈 대응)
  private previousCanvasSize: { width: number; height: number } | null = null;
  private resizeHandler?: () => void;
  
  // 고정된 게임 해상도 (플래시 게임 방식)
  private readonly gameSize = { width: 800, height: 600 };
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.hud = new HUD(canvas);
    this.config = { ...defaultConfig };
    
    this.setupEventListeners();
    this.setupResizeHandler();
  }
  
  // 논리적 캔버스 크기 가져오기 (DPR 스케일링 고려)
  private getCanvasSize(): { width: number; height: number } {
    return {
      width: (this.canvas as any).logicalWidth || this.canvas.width,
      height: (this.canvas as any).logicalHeight || this.canvas.height
    };
  }
  
  // 고정된 게임 해상도에서는 좌표 변환이 필요 없음
  // 모든 좌표가 직접 사용됨
  
  // 리사이즈 이벤트 핸들러 설정
  private setupResizeHandler() {
    this.resizeHandler = () => {
      // 단순히 이전 크기만 업데이트 (토마토 위치는 절대 변경하지 않음)
      this.previousCanvasSize = this.getCanvasSize();
    };
    
    window.addEventListener('resize', this.resizeHandler);
  }
  
  
  // 토마토를 게임 영역 내로 제한 (여백 제외)
  private constrainTomatoToGameArea(tomato: Tomato) {
    const radius = tomato.radius;
    const margin = this.config.margin;
    
    // 게임 영역 경계 계산 (여백 제외)
    const minX = margin.left + radius;
    const maxX = this.gameSize.width - margin.right - radius;
    const minY = margin.top + radius;
    const maxY = this.gameSize.height - margin.bottom - radius;
    
    // 토마토가 게임 영역을 벗어났는지 체크
    const wasOutside = tomato.x < minX || tomato.x > maxX || tomato.y < minY || tomato.y > maxY;
    
    // 위치 제한
    tomato.x = Math.max(minX, Math.min(maxX, tomato.x));
    tomato.y = Math.max(minY, Math.min(maxY, tomato.y));
    
    // 경계에 닿으면 정지
    if (wasOutside && tomato.isMoving) {
      tomato.stop();
    }
  }
  
  
  // 이벤트 리스너 설정
  private setupEventListeners() {
    // 마우스 다운 - 게임 시작, 토마토 선택 또는 게임 오버 시 재시작
    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.gameStarted) {
        this.startGame();
        return;
      }
      
      if (this.isGameOver) {
        this.restart();
        return;
      }
      
      if (this.shotsLeft <= 0) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 정지된 토마토 중에서 클릭된 것 찾기
      for (const tomato of this.tomatoes) {
        if (!tomato.isMoving && tomato.containsPoint(x, y)) {
          this.selectedTomato = tomato;
          this.isAiming = true;
          this.mouseX = x;
          this.mouseY = y;
          break;
        }
      }
    });
    
    // 마우스 이동 - 에임 라인 업데이트
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isAiming) return;
      
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
    
    // 마우스 업 - 토마토 발사
    this.canvas.addEventListener('mouseup', () => {
      if (this.isAiming && this.selectedTomato) {
        this.launchTomato();
      }
      
      this.selectedTomato = null;
      this.isAiming = false;
    });
    
    // 마우스가 캔버스를 벗어나면 에임 취소
    this.canvas.addEventListener('mouseleave', () => {
      this.selectedTomato = null;
      this.isAiming = false;
    });
  }
  
  // 토마토 발사
  private launchTomato() {
    if (!this.selectedTomato || this.shotsLeft <= 0) return;
    
    // 고정된 해상도에서는 마우스 좌표를 직접 사용
    const maxDistance = this.config.baseRange + this.selectedTomato.value * this.config.rangePerValue;
    
    this.selectedTomato.launch(
      this.mouseX,
      this.mouseY,
      maxDistance,
      this.config.moveSpeed
    );
    
    // 발사된 토마토 추적
    this.launchedTomatoes.add(this.selectedTomato);
    
    this.shotsLeft--; // 발사 시 기본 -1 차감
    
    // 샷이 0이 되면 게임 오버 체크
    if (this.shotsLeft <= 0) {
      this.checkGameOver();
    }
  }
  
  // 게임 시작 (메인 루프만 시작)
  start() {
    this.gameLoop(0);
  }
  
  // 실제 게임 시작
  private startGame() {
    this.gameStarted = true;
    this.gameStartTime = performance.now();
    this.restart();
  }
  
  // 게임 재시작
  private restart() {
    // 게임 크기를 사용하여 토마토 생성
    this.tomatoes = createInitialTomatoes(
      this.config,
      this.gameSize.width,
      this.gameSize.height
    );
    
    this.score = 0;
    this.shotsLeft = this.config.startShots;
    this.isGameOver = false;
    this.gameStarted = true;
    this.selectedTomato = null;
    this.isAiming = false;
    this.launchedTomatoes.clear(); // 발사된 토마토 추적 초기화
    
    // 타이머 초기화
    this.remainingTime = this.gameTimeLimit;
    this.gameStartTime = performance.now();
    
    // 현재 화면 크기를 저장
    this.previousCanvasSize = this.getCanvasSize();
  }
  
  // 게임 오버 체크
  private checkGameOver() {
    // 이동 중인 토마토가 있으면 아직 게임 오버가 아님
    const hasMovingTomatoes = this.tomatoes.some(t => t.isMoving);
    if (!hasMovingTomatoes && (this.shotsLeft <= 0 || this.remainingTime <= 0)) {
      this.isGameOver = true;
    }
  }
  
  // 게임 루프
  private gameLoop = (currentTime: number) => {
    const deltaTime = (currentTime - this.lastTime) / 1000; // 초 단위
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    this.animationId = requestAnimationFrame(this.gameLoop);
  };
  
  // 게임 상태 업데이트
  private update(deltaTime: number) {
    if (!this.gameStarted || this.isGameOver) return;
    
    // 화면 크기 변경 체크
    this.checkForResize();
    
    // 타이머 업데이트
    this.updateTimer();
    
    // 모든 토마토 업데이트
    for (const tomato of this.tomatoes) {
      tomato.update(deltaTime);
      
      // 토마토가 게임 영역을 벗어나면 정지
      this.constrainTomatoToGameArea(tomato);
    }
    
    // 충돌 검사 및 처리
    this.handleCollisions();
    
    // 충돌 없이 멈춘 토마토 페널티 처리
    this.handleNonCollisionPenalty();
    
    // 게임 오버 체크 (샷이 0이거나 시간이 다 되고 이동 중인 토마토가 없으면)
    if (this.shotsLeft <= 0 || this.remainingTime <= 0) {
      this.checkGameOver();
    }
  }
  
  // 화면 크기 변경 체크 (게임 루프에서 호출)
  private checkForResize() {
    const currentSize = this.getCanvasSize();
    
    if (this.previousCanvasSize && 
        (currentSize.width !== this.previousCanvasSize.width || 
         currentSize.height !== this.previousCanvasSize.height)) {
      // 단순히 이전 크기만 업데이트 (토마토는 절대 위치 유지)
      this.previousCanvasSize = currentSize;
    }
  }
  
  // 타이머 업데이트
  private updateTimer() {
    const currentTime = performance.now();
    const elapsedSeconds = (currentTime - this.gameStartTime) / 1000;
    this.remainingTime = Math.max(0, this.gameTimeLimit - elapsedSeconds);
    
    // 시간이 0이 되면 즉시 게임 오버
    if (this.remainingTime <= 0) {
      this.isGameOver = true;
    }
  }
  
  // 충돌 처리
  private handleCollisions() {
    const movingTomatoes = this.tomatoes.filter(t => t.isMoving);
    
    for (const movingTomato of movingTomatoes) {
      const hitTomatoes = findCollisions(movingTomato, this.tomatoes);
      
      if (hitTomatoes.length > 0) {
        // 충돌 발생 - 합성 규칙 적용
        const result = resolveCollision(
          movingTomato,
          hitTomatoes,
          this.tomatoes,
          this.config,
          this.gameSize.width,
          this.gameSize.height
        );
        
        this.score += result.scoreGained;
        this.shotsLeft += result.shotsGained;
        
        // 충돌한 토마토는 발사 추적에서 제거 (페널티 없음)
        this.launchedTomatoes.delete(movingTomato);
        
        // 충돌 후 토마토 정지
        movingTomato.stop();
      }
    }
  }
  
  // 충돌 없이 멈춘 토마토들에 대한 페널티 처리
  private handleNonCollisionPenalty() {
    // 발사되었지만 충돌하지 않고 멈춘 토마토들 확인
    const stoppedTomatoes = Array.from(this.launchedTomatoes).filter(tomato => !tomato.isMoving);
    
    for (const tomato of stoppedTomatoes) {
      // 충돌 없이 멈춘 토마토에 추가 페널티
      this.shotsLeft -= 1; // 추가 -1 페널티 (총 -2)
      this.launchedTomatoes.delete(tomato); // 추적에서 제거
      
      // 실패 시 추가로 0(사과) 생성 (방해요소 증가)
      this.addApplePenalty();
    }
  }
  
  // 실패 시 사과 추가 생성
  private addApplePenalty() {
    const appleTomato = createTomatoWithValue(0, this.tomatoes, this.config, this.gameSize.width, this.gameSize.height);
    if (appleTomato) {
      this.tomatoes.push(appleTomato);
    }
  }
  
  // 게임 영역 렌더링
  private renderGameArea() {
    const margin = this.config.margin;
    
    // 게임 영역 배경 (약간 밝게)
    this.ctx.fillStyle = '#3a3a3a';
    this.ctx.fillRect(
      margin.left,
      margin.top,
      this.gameSize.width - margin.left - margin.right,
      this.gameSize.height - margin.top - margin.bottom
    );
    
    // 게임 영역 테두리 (명확한 구분)
    this.ctx.strokeStyle = '#555';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      margin.left,
      margin.top,
      this.gameSize.width - margin.left - margin.right,
      this.gameSize.height - margin.top - margin.bottom
    );
    
    // 여백 영역에 텍스트 표시
    this.ctx.save();
    this.ctx.fillStyle = '#666';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    
    // 상단 여백 (광고 공간)
    if (margin.top > 30) {
      this.ctx.fillText('광고 영역', this.gameSize.width / 2, margin.top / 2);
    }
    
    // 하단 여백 (랭킹 공간)
    if (margin.bottom > 30) {
      this.ctx.fillText(
        '랭킹 영역',
        this.gameSize.width / 2,
        this.gameSize.height - margin.bottom / 2
      );
    }
    
    this.ctx.restore();
  }
  
  // 렌더링
  private render() {
    // 화면 지우기
    this.ctx.clearRect(0, 0, this.gameSize.width, this.gameSize.height);
    
    // 배경
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, 0, this.gameSize.width, this.gameSize.height);
    
    // 게임 영역 표시 (여백 영역과 구분)
    this.renderGameArea();
    
    // 토마토들 렌더링 (고정된 해상도에서 직접 렌더링)
    for (const tomato of this.tomatoes) {
      tomato.render(this.ctx);
    }
    
    // 선택된 토마토는 에임 라인으로만 표시 (별도 하이라이트 제거)
    
    // 에임 라인 표시
    if (this.isAiming && this.selectedTomato) {
      const maxDistance = this.config.baseRange + this.selectedTomato.value * this.config.rangePerValue;
      this.hud.renderAimLine(
        this.selectedTomato.x,
        this.selectedTomato.y,
        this.mouseX,
        this.mouseY,
        maxDistance
      );
    }
    
    // 게임 시작 전 화면
    if (!this.gameStarted) {
      this.renderStartScreen();
      return;
    }
    
    // HUD 렌더링
    this.hud.renderStats(this.score, this.shotsLeft, this.remainingTime);
    
    // 게임 오버 화면
    if (this.isGameOver) {
      const isTimeUp = this.remainingTime <= 0;
      this.hud.renderGameOver(this.score, this.config.margin, isTimeUp);
    }
  }
  
  // 시작 화면 렌더링
  private renderStartScreen() {
    this.ctx.save();
    
    // 배경
    this.ctx.fillStyle = '#2a2a2a';
    this.ctx.fillRect(0, 0, this.gameSize.width, this.gameSize.height);
    
    // 게임 영역 표시
    this.renderGameArea();
    
    // 반투명 오버레이
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.gameSize.width, this.gameSize.height);
    
    // 게임 제목
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const centerX = this.gameSize.width / 2;
    const centerY = this.gameSize.height / 2;
    
    this.ctx.fillText('토마토 숫자 게임', centerX, centerY - 80);
    
    // 게임 설명
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillText('숫자를 합쳐서 10을 만드세요!', centerX, centerY - 20);
    
    // 시작 버튼
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = centerX - buttonWidth / 2;
    const buttonY = centerY + 20;
    
    // 버튼 배경
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // 버튼 테두리
    this.ctx.strokeStyle = '#45a049';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // 버튼 텍스트
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('게임 시작', centerX, centerY + 50);
    
    // 조작 안내
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#999';
    this.ctx.fillText('클릭하고 드래그하여 발사하세요', centerX, centerY + 120);
    
    this.ctx.restore();
  }
  

  // 게임 정리
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // 리사이즈 이벤트 리스너 제거
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
