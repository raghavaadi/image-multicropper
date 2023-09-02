import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'lib-image-multicropper',
  template: `
    <input type="file" (change)="onFileChange($event)" accept="image/*">
    <canvas #canvas></canvas>
    <button (click)="cropImage()">Crop</button>
  `,
})
export class ImageMulticropperComponent implements AfterViewInit {

  @Input() parts: number = 2;
  @Input() canvasWidth: number = 400;
  @Input() canvasHeight: number = 851;
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private image: HTMLImageElement | null = null;
  private dragLineIndex: number | null = null;
  private linePositions: number[] = [];
  showLines: boolean = true;

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    const canvas = this.canvasRef.nativeElement;
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  cropImage() {
    if (!this.ctx || !this.image) return;
    const tempLines = [...this.linePositions];
    this.showLines = false; this.redrawCanvas(); this.linePositions.push(this.canvasHeight);
    this.cropAndDisplayImages(); this.linePositions = tempLines; this.showLines = true;
    this.redrawCanvas();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.loadImage((e.target as FileReader).result as string);
      reader.readAsDataURL(file);
    }
  }

  private loadImage(dataUrl: string) {
    this.image = new Image(); this.image.src = dataUrl;
    this.image.onload = () => {
      this.canvasRef.nativeElement.width = this.canvasWidth;
      this.canvasRef.nativeElement.height = this.canvasHeight;
      this.scaleAndDrawImage(); this.initializeLinePositions(); this.redrawCanvas();
    }
  }

  private scaleAndDrawImage() {
    if (this.ctx) {
      const {width, height} = this.calculateDimensions();
      const centerX = (this.canvasWidth - width) / 2;
      const centerY = (this.canvasHeight - height) / 2;
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.drawImage(this.image!, 0, 0, this.image!.width, this.image!.height, centerX, centerY, width, height);
    }
  }

  private calculateDimensions() {
    const canvasRatio = this.canvasWidth / this.canvasHeight;
    const imageRatio = this.image!.width / this.image!.height;
    return imageRatio > canvasRatio ? 
      { width: this.canvasWidth, height: this.canvasWidth / imageRatio } : 
      { width: this.canvasHeight * imageRatio, height: this.canvasHeight };
  }

  private initializeLinePositions() {
    const segmentHeight = this.canvasHeight / this.parts;
    this.linePositions = Array.from({length: this.parts - 1}, (_, i) => segmentHeight * (i + 1));
  }

  private redrawCanvas() {
    this.scaleAndDrawImage();
    if (this.showLines) {
      this.linePositions.forEach(pos => {
        this.ctx?.beginPath(); this.ctx?.moveTo(0, pos); this.ctx?.lineTo(this.canvasWidth, pos);
        this.ctx!.strokeStyle = 'red'; 
        this.ctx!.lineWidth = 2;
        this.ctx?.stroke();
      });
    }
  }

  private cropAndDisplayImages() {
    let prevY = 0;
    this.linePositions.forEach((y) => {
      const height = y - prevY;
      const imgData = this.ctx!.getImageData(0, prevY, this.canvasWidth, height);
      const canvas = document.createElement('canvas');
      canvas.width = this.canvasWidth; canvas.height = height;
      canvas.getContext('2d')?.putImageData(imgData, 0, 0);
      const img = document.createElement('img'); img.src = canvas.toDataURL();
      document.body.appendChild(img); prevY = y;
    });
  }

  private onMouseDown(event: MouseEvent) {
    const y = event.clientY - this.canvasRef.nativeElement.getBoundingClientRect().top;
    this.dragLineIndex = this.linePositions.findIndex(linePos => y > linePos - 5 && y < linePos + 5);
  }

  private onMouseMove(event: MouseEvent) {
    if (this.dragLineIndex === null) return;
    const y = event.clientY - this.canvasRef.nativeElement.getBoundingClientRect().top;
    if (y > 0 && y < this.canvasHeight) {
      this.linePositions[this.dragLineIndex] = y; this.redrawCanvas();
    }
  }

  private onMouseUp() {
    this.dragLineIndex = null;
  }
}
