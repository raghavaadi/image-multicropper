import { Component, Input, ElementRef, AfterViewInit ,ViewChild } from '@angular/core';

@Component({
  selector: 'lib-image-multicropper',
  template: `
    <input type="file" (change)="onFileChange($event)" accept="image/*">
    <canvas #canvas></canvas>
    <button (click)="cropImage()">Crop</button>
  `,
  styles: []
})
export class ImageMulticropperComponent implements AfterViewInit {

  @Input() parts: number = 2;
  @Input() canvasWidth: number = 400;  // Default values if not provided by user
  @Input() canvasHeight: number = 851; // Default values if not provided by user

  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  showLines: boolean = true;

  private image: HTMLImageElement | null = null;
  private dragLineIndex: number | null = null;
  private linePositions: number[] = [];
  defaultWidth =100;
  defaultHeight =100;
  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d');

    this.canvasRef.nativeElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvasRef.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvasRef.nativeElement.addEventListener('mouseup', this.onMouseUp.bind(this));
  }
  cropImage() {
    if (!this.ctx || !this.image) return;

    let previousY = 0;

    this.showLines = false;
    this.redrawCanvas();
    // this.linePositions.push(this.image.height);  // to include the last segment
    let tempLines =JSON.parse(JSON.stringify( this.linePositions))
    this.linePositions.push(this.canvasHeight);  // to include the last segment

    this.linePositions.forEach((y, index) => {
        const height = y - previousY;
        const croppedImage = this.ctx!.getImageData(0, previousY, this.canvasWidth, height);

        const canvas = document.createElement('canvas');
        canvas.width = this.canvasWidth
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (context) {
            context.putImageData(croppedImage, 0, 0);
        }

        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        document.body.appendChild(img);  // append the cropped image segments to the body

        previousY = y;
    });
    this.showLines = true;
    this.linePositions =  tempLines
    this.redrawCanvas();
}

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.loadImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  private loadImage(dataUrl: string) {
    this.image = new Image();
    this.image.src = dataUrl;
    this.image.onload = () => {
      // Set canvas dimensions

      this.canvasRef.nativeElement.width = this.canvasWidth;
      this.canvasRef.nativeElement.height = this.canvasHeight;

      if (this.ctx) {
          // Calculate aspect ratios
          const canvasAspectRatio = this.canvasWidth / this.canvasHeight;
          const imageAspectRatio = this.image!.width / this.image!.height;

          let targetWidth: number;
          let targetHeight: number;

          // Compare the canvas's aspect ratio with the image's to determine the scaling dimension
          if (imageAspectRatio > canvasAspectRatio) {
              // The image's width becomes the limiting factor
              targetWidth = this.canvasWidth;
              targetHeight = this.canvasWidth / imageAspectRatio;
          } else {
              // The image's height becomes the limiting factor
              targetHeight =this.canvasHeight;
              targetWidth = this.canvasHeight * imageAspectRatio;
          }

          // Center the image on the canvas
          const centerShift_x = (this.canvasWidth - targetWidth) / 2;
          const centerShift_y = (this.canvasHeight - targetHeight) / 2;

          // Clear the canvas and draw the scaled image
          this.ctx.clearRect(0, 0,this.canvasWidth,this.canvasHeight);
          this.ctx.drawImage(this.image!, 0, 0, this.image!.width, this.image!.height, 
                             centerShift_x, centerShift_y, targetWidth, targetHeight);
      }

        this.initializeLinePositions();
        this.redrawCanvas();
    }
}


  private initializeLinePositions() {
    const canvasHeight = 851;
    const segmentHeight = canvasHeight / this.parts;
    this.linePositions = [];
    for (let i = 1; i < this.parts; i++) {
      this.linePositions.push(segmentHeight * i);
    }
  }

  private redrawCanvas() {
    if (this.ctx && this.image  ) {
  
      const canvasAspectRatio = this.canvasWidth / this.canvasHeight;
      const imageAspectRatio = this.image!.width / this.image!.height;
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      let targetWidth: number;
      let targetHeight: number;

      // Compare the canvas's aspect ratio with the image's to determine the scaling dimension
      if (imageAspectRatio > canvasAspectRatio) {
          // The image's width becomes the limiting factor
          targetWidth = this.canvasWidth;
          targetHeight = this.canvasWidth / imageAspectRatio;
      } else {
          // The image's height becomes the limiting factor
          targetHeight = this.canvasHeight;
          targetWidth = this.canvasHeight * imageAspectRatio;
      }

      // Center the image on the canvas
      const centerShift_x = (this.canvasWidth - targetWidth) / 2;
      const centerShift_y = (this.canvasHeight - targetHeight) / 2;
      //this.ctx.drawImage(this.image, 0, 0);
      this.ctx.drawImage(this.image!, 0, 0, this.image!.width, this.image!.height, 
        centerShift_x, centerShift_y, targetWidth, targetHeight);
        if(this.showLines){
      for (const linePos of this.linePositions) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, linePos);
        // this.ctx.lineTo(this.image.width, linePos);
        this.ctx.lineTo(this.canvasWidth, linePos);
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    }
    }
  }

  private onMouseDown(event: MouseEvent) {
    if (!this.image || !this.ctx) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const y = event.clientY - rect.top;

    for (let i = 0; i < this.linePositions.length; i++) {
      const linePos = this.linePositions[i];
      if (y > linePos - 5 && y < linePos + 5) {
        this.dragLineIndex = i;
        break;
      }
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.image || !this.ctx || this.dragLineIndex === null) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const y = event.clientY - rect.top;

    if (y > 0 && y < this.canvasHeight) {//this.image.height
      this.linePositions[this.dragLineIndex] = y;
      this.redrawCanvas();
    }
  }

  private onMouseUp() {
    this.dragLineIndex = null;
  }
}