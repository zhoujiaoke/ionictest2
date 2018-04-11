import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PicPage } from './pic';

@NgModule({
  declarations: [
    PicPage,
  ],
  imports: [
    IonicPageModule.forChild(PicPage),
  ],
  exports: [
    PicPage
  ]
})
export class ListPageModule {}
