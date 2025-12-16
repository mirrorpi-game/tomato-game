export class HUD {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }
  
  // 둥근 모서리 사각형 그리기 헬퍼
  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
  
  // 점수와 남은 샷 수, 남은 시간 표시 (컴팩트한 박스)
  renderStats(score: number, shotsLeft: number, remainingTime: number) {
    this.ctx.save();
    
    // 컴팩트한 HUD 박스 (더 작은 크기)
    const hudWidth = 140;
    const hudHeight = 60;
    const hudX = 10;
    const hudY = 10;
    
    // 배경 박스 (둥근 모서리)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.drawRoundedRect(hudX, hudY, hudWidth, hudHeight, 8);
    this.ctx.fill();
    
    // 테두리
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // 텍스트 스타일 (더 작은 폰트)
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    // 점수 표시
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`점수: ${score}`, hudX + 8, hudY + 8);
    
    // 남은 시간 표시 (분:초 형식)
    const minutes = Math.floor(remainingTime / 60);
    const seconds = Math.floor(remainingTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // 시간이 10초 이하일 때 빨간색으로 표시
    if (remainingTime <= 10) {
      this.ctx.fillStyle = '#ff4444';
    } else {
      this.ctx.fillStyle = '#fff';
    }
    this.ctx.fillText(`시간: ${timeString}`, hudX + 8, hudY + 25);
    
    // 남은 샷 수 표시
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`샷: ${shotsLeft}`, hudX + 8, hudY + 42);
    
    this.ctx.restore();
  }
  
  // 에임 라인 표시 (고정된 크기)
  renderAimLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    maxDistance: number
  ) {
    this.ctx.save();
    
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 최대 거리 제한 적용
    const actualDistance = Math.min(distance, maxDistance);
    const ratio = actualDistance / distance;
    const actualEndX = startX + dx * ratio;
    const actualEndY = startY + dy * ratio;
    
    // 에임 라인 그리기
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([10, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(actualEndX, actualEndY);
    this.ctx.stroke();
    
    // 최대 거리 원 표시
    this.ctx.setLineDash([]);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(startX, startY, maxDistance, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // 발사 지점 표시
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(actualEndX, actualEndY, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  // 게임 오버 화면 (고정된 크기)
  renderGameOver(score: number, gameAreaMargin?: { top: number; bottom: number; left: number; right: number }, isTimeUp: boolean = false) {
    this.ctx.save();
    
    // 고정된 게임 해상도
    const gameWidth = 800;
    const gameHeight = 600;
    
    // 반투명 배경 (전체 화면)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, gameWidth, gameHeight);
    
    // 게임 영역의 중앙 계산
    let centerX = gameWidth / 2;
    let centerY = gameHeight / 2;
    
    if (gameAreaMargin) {
      // 게임 영역 중앙으로 조정
      const gameAreaWidth = gameWidth - gameAreaMargin.left - gameAreaMargin.right;
      const gameAreaHeight = gameHeight - gameAreaMargin.top - gameAreaMargin.bottom;
      centerX = gameAreaMargin.left + gameAreaWidth / 2;
      centerY = gameAreaMargin.top + gameAreaHeight / 2;
    }
    
    // 고정된 크기
    const boxWidth = 300;
    const boxHeight = 200;
    
    // 게임 오버 박스 배경
    this.ctx.fillStyle = 'rgba(40, 40, 40, 0.95)';
    this.ctx.fillRect(
      centerX - boxWidth / 2,
      centerY - boxHeight / 2,
      boxWidth,
      boxHeight
    );
    
    // 박스 테두리
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      centerX - boxWidth / 2,
      centerY - boxHeight / 2,
      boxWidth,
      boxHeight
    );
    
    // 게임 오버 텍스트
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const gameOverText = isTimeUp ? '시간 종료!' : '게임 오버';
    this.ctx.fillText(gameOverText, centerX, centerY - 40);
    
    // 최종 점수
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#ffdd44';
    this.ctx.fillText(`최종 점수: ${score}`, centerX, centerY);
    
    // 재시작 안내
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillText('클릭하여 재시작', centerX, centerY + 40);
    
    this.ctx.restore();
  }
}
