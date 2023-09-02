import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { ImageMulticropperModule } from 'image-multicropper';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ImageMulticropperModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
