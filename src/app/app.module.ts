import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HttpModule }    from '@angular/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera } from '@ionic-native/camera';
import { FileTransfer } from '@ionic-native/file-transfer';

import { StorageService } from '../service/storage.service';
import { HomeService } from '../service/home.service';
import { NativeServiceProvider } from '../service/native.service';


@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Camera,
    FileTransfer,
    StorageService,
    HomeService,
    NativeServiceProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
