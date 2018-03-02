import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestlocatePage } from './testlocate';

@NgModule({
  declarations: [
    TestlocatePage,
  ],
  imports: [
    IonicPageModule.forChild(TestlocatePage),
  ],
  entryComponents: [TestlocatePage ],
  exports: [
    TestlocatePage
  ]
})
export class TabsPageModule {}
