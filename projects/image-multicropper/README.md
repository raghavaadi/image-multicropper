# Image-Multicropper Angular Library

A simple Angular component to allow users to split an image into multiple parts based on their input.

## Installation

To install this library, run:

npm install @your-npm-username/image-multicropper

Replace @your-npm-username with your npm username or the name you've published the library under.

## Usage
Import the ImageMulticropperModule in your Angular module:

import { ImageMulticropperModule } from '@your-npm-username/image-multicropper';

@NgModule({
  declarations: [AppComponent],
  imports: [ImageMulticropperModule],
  bootstrap: [AppComponent]
})
export class AppModule { }

Use the component in your Angular component:
<lib-image-multicropper [parts]="2" [canvasWidth]="400" [canvasHeight]="851"></lib-image-multicropper>


## Attributes
parts (default = 2): Number of segments you want to divide the image into.
canvasWidth (default = 400): Width of the canvas.
canvasHeight (default = 851): Height of the canvas.

## Events
onFileChange: Triggered when an image is uploaded. Opens a file dialog to select an image.
cropImage: Triggered when the crop button is clicked. It crops the image based on the segments.

## Features
Drag the lines over the uploaded image to adjust the cropping boundaries.
The image will fit within the dimensions of the canvas provided.

## Contributing
Feel free to fork, improve, make pull requests or fill issues. I'll appreciate any help and involvement.
