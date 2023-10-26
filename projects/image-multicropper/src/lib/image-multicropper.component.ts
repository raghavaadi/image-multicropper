import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'lib-image-multicropper',
  templateUrl:'./image-multicropper.component.html',
})
export class ImageMulticropperComponent implements AfterViewInit {
  @Input() parts: number = 2;
  @Input() canvasWidth: number = 400;
  @Output() slicedImages = new EventEmitter<Blob[]>();

  @Input() canvasHeight: number = 851;
  @ViewChild('canvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private image: HTMLImageElement | null = null;
  private dragLineIndex: number | null = null;
  private linePositions: number[] = [];
  showLines: boolean = true;
  showcrop: boolean = true;
  isCropping: boolean = false;
  cropStart: { x: number; y: number } = { x: 0, y: 0 };
  cropEnd: { x: number; y: number } = { x: 0, y: 0 };
  isSelecting: boolean = false;
  selectionStart: { x: number; y: number } = { x: 0, y: 0 };
  selectionEnd: { x: number; y: number } = { x: 0, y: 0 };

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    const canvas = this.canvasRef.nativeElement;
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }
  toggleCropping() {
    console.log('called');
    this.isCropping = !this.isCropping;
  }

  cropImage() {
    if (!this.ctx || !this.image) return;
    const tempLines = [...this.linePositions];
    this.showLines = false;
    this.redrawCanvas();
    this.linePositions.push(this.canvasHeight);
    this.cropAndDisplayImages();
    this.linePositions = tempLines;
    this.showLines = true;
    this.redrawCanvas();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) =>
        this.loadImage((e.target as FileReader).result as string);
      reader.readAsDataURL(file);
    }
  }

  private loadImage(dataUrl: string) {
    this.image = new Image();
    this.image.src = dataUrl;
    this.image.onload = () => {
      this.canvasRef.nativeElement.width = this.canvasWidth;
      this.canvasRef.nativeElement.height = this.canvasHeight;
      this.scaleAndDrawImage();
      this.initializeLinePositions();
      this.redrawCanvas();
    };
  }

  private scaleAndDrawImage() {
    if (this.ctx) {
      const { width, height } = this.calculateDimensions();
      const centerX = (this.canvasWidth - width) / 2;
      const centerY = (this.canvasHeight - height) / 2;
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.drawImage(
        this.image!,
        0,
        0,
        this.image!.width,
        this.image!.height,
        centerX,
        centerY,
        width,
        height
      );
    }
  }

  private calculateDimensions() {
    const canvasRatio = this.canvasWidth / this.canvasHeight;
    const imageRatio = this.image!.width / this.image!.height;
    return imageRatio > canvasRatio
      ? { width: this.canvasWidth, height: this.canvasWidth / imageRatio }
      : { width: this.canvasHeight * imageRatio, height: this.canvasHeight };
  }

  private initializeLinePositions() {
    const segmentHeight = this.canvasHeight / this.parts;
    this.linePositions = Array.from(
      { length: this.parts - 1 },
      (_, i) => segmentHeight * (i + 1)
    );
  }

  private redrawCanvas() {
    if (this.ctx && this.image) {
      this.scaleAndDrawImage();
      if (
        this.isSelecting ||
        (this.selectionStart.x !== this.selectionEnd.x &&
          this.selectionStart.y !== this.selectionEnd.y)
      ) {
        // Draw the selection rectangle
        if(this.showcrop){
        this.ctx.beginPath();
        this.ctx.rect(
          this.selectionStart.x,
          this.selectionStart.y,
          this.selectionEnd.x - this.selectionStart.x,
          this.selectionEnd.y - this.selectionStart.y
        );

        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        }
      }
      if (this.showLines) {
        this.linePositions.forEach((pos) => {
          this.ctx?.beginPath();
          this.ctx?.moveTo(0, pos);
          this.ctx?.lineTo(this.canvasWidth, pos);
          this.ctx!.strokeStyle = 'red';
          this.ctx!.lineWidth = 2;
          this.ctx?.stroke();
        });
      }
    }
  }

  cropSelectedArea() {
    if (!this.ctx || !this.image) return;

    let x = Math.min(this.selectionStart.x, this.selectionEnd.x);
    let y = Math.min(this.selectionStart.y, this.selectionEnd.y);
    const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
    const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
  this.showLines =false
  this.showcrop =false
  this.redrawCanvas();
    const croppedImage = this.ctx.getImageData(x, y, width, height);

    // Clear the entire canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Set new canvas dimensions to match the cropped area size
    this.canvasRef.nativeElement.width = width;
    this.canvasRef.nativeElement.height = height;

    // Draw the cropped image back onto the canvas
    this.ctx.putImageData(croppedImage, 0, 0);

    // Optionally: Update the internal image to be the cropped one (this might be useful in case of further operations on the image)
    const dataURL = this.canvasRef.nativeElement.toDataURL();

    this.selectionStart = { x: 0, y: 0 };
    this.selectionEnd = { x: 0, y: 0 };
    this.isSelecting = false;
    this.isCropping = false;
    this.showLines = true;
  this.showcrop =true

    this.loadImage(dataURL);
  }

  private cropAndDisplayImages() {
    let prevY = 0;
    const blobs: Blob[] = [];
    let totalLength = this.linePositions.length;
    this.linePositions.forEach((y) => {
      const height = y - prevY;
      const imgData = this.ctx!.getImageData(
        0,
        prevY,
        this.canvasWidth,
        height
      );
      const canvas = document.createElement('canvas');
      canvas.width = this.canvasWidth;
      canvas.height = height;
      canvas.getContext('2d')?.putImageData(imgData, 0, 0);
      // const img = document.createElement('img');
      // img.src = canvas.toDataURL();
      // // document.body.appendChild(img);

      canvas.toBlob((blob) => {
        if (blob) {
          blobs.push(blob);
          if (blobs.length === totalLength) {
            this.slicedImages.emit(blobs);
          }
        }
      });
      prevY = y;
    });
  }

  private onMouseDown(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    console.log(this.isCropping);
    if (this.isCropping) {
      this.isSelecting = true;
      this.selectionStart.x = event.clientX - rect.left;
      this.selectionStart.y = event.clientY - rect.top;
      this.selectionEnd.x = event.clientX - rect.left;
      this.selectionEnd.y = event.clientY - rect.top;

      this.redrawCanvas();
    } else {
      console.log('ivanthan');
      const y =
        event.clientY -
        this.canvasRef.nativeElement.getBoundingClientRect().top;
      this.dragLineIndex = this.linePositions.findIndex(
        (linePos) => y > linePos - 5 && y < linePos + 5
      );
      console.log('avanthan');
    }
  }

  private onMouseMove(event: MouseEvent) {
    console.log(MouseEvent, this.isCropping);
    if (this.isCropping) {
      if (this.isSelecting) {
        const rect = this.canvasRef.nativeElement.getBoundingClientRect();
        this.selectionEnd.x = event.clientX - rect.left;
        this.selectionEnd.y = event.clientY - rect.top;

        this.redrawCanvas();
      }
    } else {
      if (this.dragLineIndex === null) return;
      const y =
        event.clientY -
        this.canvasRef.nativeElement.getBoundingClientRect().top;
      if (y > 0 && y < this.canvasHeight) {
        this.linePositions[this.dragLineIndex] = y;
        this.redrawCanvas();
      }
    }
  }

  private onMouseUp() {
    this.dragLineIndex = null;
    this.isSelecting = false;
  }
}
