import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QueryPage } from './query';

@NgModule({
  declarations: [
    QueryPage,
  ],
  imports: [
    IonicPageModule.forChild(QueryPage),
  ],
  entryComponents: [QueryPage ],
  exports: [
    QueryPage
  ]
})
export class QueryPageModule {}
