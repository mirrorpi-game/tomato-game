export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export class Tomato {
  public x: number;
  public y: number;
  public value: number; // 1~9
  public radius: number;
  public isMoving: boolean = false;
  public velocity: Velocity = { x: 0, y: 0 };
  public remainingDistance: number = 0;
  
  constructor(x: number, y: number, value: number, radius: number) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.radius = radius;
  }
  
  // 토마토 발사
  launch(targetX: number, targetY: number, maxDistance: number, speed: number) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 최대 거리 제한
    const actualDistance = Math.min(distance, maxDistance);
    
    // 정규화된 방향 벡터
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    // 속도 설정
    this.velocity.x = normalizedDx * speed;
    this.velocity.y = normalizedDy * speed;
    
    this.isMoving = true;
    this.remainingDistance = actualDistance;
  }
  
  // 프레임마다 위치 업데이트
  update(deltaTime: number) {
    if (!this.isMoving) return;
    
    const moveDistance = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y) * deltaTime;
    
    if (moveDistance >= this.remainingDistance) {
      // 남은 거리만큼만 이동하고 정지
      const ratio = this.remainingDistance / moveDistance;
      this.x += this.velocity.x * deltaTime * ratio;
      this.y += this.velocity.y * deltaTime * ratio;
      this.stop();
    } else {
      // 정상 이동
      this.x += this.velocity.x * deltaTime;
      this.y += this.velocity.y * deltaTime;
      this.remainingDistance -= moveDistance;
    }
  }
  
  // 이동 정지
  stop() {
    this.isMoving = false;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.remainingDistance = 0;
  }
  
  // 렌더링
  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    if (this.value === 0) {
      // 0은 사과 모양으로 그리기
      this.renderApple(ctx);
    } else {
      // 1~9는 토마토 모양으로 그리기
      this.renderTomato(ctx);
    }
    
    ctx.restore();
  }
  
  // 사과 그리기 (0 값용)
  private renderApple(ctx: CanvasRenderingContext2D) {
    // 사과 몸체 (빨간색)
    ctx.fillStyle = '#e74c3c'; // 빨간색
    ctx.beginPath();
    ctx.arc(this.x, this.y + this.radius * 0.1, this.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    // 사과 테두리
    ctx.strokeStyle = this.isMoving ? '#fff' : '#c0392b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 사과 꼭지 (갈색)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(this.x - this.radius * 0.1, this.y - this.radius * 0.7, this.radius * 0.2, this.radius * 0.4);
    
    // 사과 잎사귀 (녹색)
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.ellipse(this.x + this.radius * 0.2, this.y - this.radius * 0.6, this.radius * 0.3, this.radius * 0.15, Math.PI * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 하이라이트 효과
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x - this.radius * 0.3, this.y - this.radius * 0.2, this.radius * 0.2, this.radius * 0.4, Math.PI * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 숫자 표시
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${this.radius * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('0', this.x, this.y + this.radius * 0.1);
  }
  
  // 토마토 그리기 (1~9 값용) - 사과처럼 간단하게
  private renderTomato(ctx: CanvasRenderingContext2D) {
    // 토마토 몸체 (빨간색, 둥근 모양)
    ctx.fillStyle = '#e74c3c'; // 토마토 빨간색
    ctx.beginPath();
    ctx.arc(this.x, this.y + this.radius * 0.1, this.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    // 토마토 테두리
    ctx.strokeStyle = this.isMoving ? '#fff' : '#c0392b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 토마토 꼭지 (자연스럽게 뾰족한 잎사귀들)
    ctx.fillStyle = '#27ae60';
    
    // 5개의 자연스럽게 뾰족한 잎사귀
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const baseX = this.x + Math.cos(angle) * this.radius * 0.2;
      const baseY = this.y - this.radius * 0.5;
      
      // 잎사귀 끝점 (뾰족한 부분)
      const tipX = baseX + Math.cos(angle) * this.radius * 0.4;
      const tipY = baseY + Math.sin(angle) * this.radius * 0.4;
      
      // 잎사귀 양쪽 가장자리 (자연스러운 곡선을 위해)
      const leftX = baseX + Math.cos(angle - 0.5) * this.radius * 0.15;
      const leftY = baseY + Math.sin(angle - 0.5) * this.radius * 0.15;
      const rightX = baseX + Math.cos(angle + 0.5) * this.radius * 0.15;
      const rightY = baseY + Math.sin(angle + 0.5) * this.radius * 0.15;
      
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      // 부드러운 곡선으로 잎사귀 모양 그리기
      ctx.quadraticCurveTo(leftX, leftY, tipX, tipY);
      ctx.quadraticCurveTo(rightX, rightY, baseX, baseY);
      ctx.fill();
    }
    
    // 하이라이트 효과 (사과와 동일한 스타일)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x - this.radius * 0.3, this.y - this.radius * 0.1, this.radius * 0.2, this.radius * 0.3, Math.PI * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 숫자 표시
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${this.radius * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.value.toString(), this.x, this.y + this.radius * 0.1);
  }
  
  // 점 포함 검사 (클릭 감지용)
  containsPoint(x: number, y: number): boolean {
    const dx = x - this.x;
    const dy = y - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}
