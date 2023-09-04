import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'demo';
  customWidth: number = 500;
customHeight: number = 900;
slicedImageUrls: string[] = [];
onSlicedImagesReceived(images: Blob[]) {
  this.slicedImageUrls = images.map(image => URL.createObjectURL(image));
}
}
