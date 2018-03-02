/**
 * Created by yanxiaojun617@163.com on 12-27.
 */
import { Injectable } from '@angular/core';
import { ToastController, LoadingController, Platform, Loading, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';

import { FileTransfer, FileUploadOptions, FileTransferObject  } from '@ionic-native/file-transfer';
import { Observable } from "rxjs/Observable";
//declare var LocationPlugin;
//declare var cordova: any;

@Injectable()
export class NativeServiceProvider {
  private loading: Loading;
  private loadingIsOpen: boolean = false;
  //private interval = 0;
  //private QUALITY_SIZE = 90;
  //private IMAGE_SIZE = 1024;
  constructor(private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,  
    private camera: Camera,
    private transfer: FileTransfer,
    private geolocation: Geolocation,
    private loadingCtrl: LoadingController) {
  }

  warn(info): void {
    console.log('%cNativeService/' + info, 'color:#C41A16');
  }

  /**
   * 使用默认状态栏
   */
  statusBarStyleDefault(): void {
    this.statusBar.styleDefault();
  }

  /**
   * 隐藏启动页面
   */
  splashScreenHide(): void {
    this.splashScreen.hide();
  }


  /**
   * 是否真机环境
   */
  isMobile(): boolean {
    return this.platform.is('mobile') && !this.platform.is('mobileweb');
  }

  /**
   * 是否android真机环境
   */
  isAndroid(): boolean {
    return this.isMobile() && this.platform.is('android');
  }

  /**
   * 是否ios真机环境
   */
  isIos(): boolean {
    return this.isMobile() && (this.platform.is('ios') || this.platform.is('ipad') || this.platform.is('iphone'));
  }

  alert(title: string): void {
    this.alertCtrl.create({
      title: title,
      buttons: [{ text: '确定' }]
    }).present();
  }

 showToast(message: string = '操作完成', duration: number = 2000, position: string = 'middle'): void {
    
    this.toastCtrl.create({
      message: message,
      duration: duration,
      position: position,
      showCloseButton: false
    }).present();
   
  };

  /**
   * 统一调用此方法显示loading
   * @param content 显示的内容
   */
  showLoading(content: string = ''): void {

    if (!this.loadingIsOpen) {
      this.loadingIsOpen = true;
      this.loading = this.loadingCtrl.create({
        content: content
      });
      this.loading.present();
      setTimeout(() => {//最长显示15秒
        this.loadingIsOpen && this.loading.dismiss();
        this.loadingIsOpen = false;
      }, 15000);
    }
  };

  /**
   * 关闭loading
   */
  hideLoading(): void {
    this.loadingIsOpen && this.loading.dismiss();
    this.loadingIsOpen = false;
  };

  /**
   * 使用cordova-plugin-camera获取照片
   * targetWidth: this.IMAGE_SIZE,//缩放图像的宽度（像素）
    targetHeight: this.IMAGE_SIZE,//缩放图像的高度（像素）
    correctOrientation: true//设置摄像机拍摄的图像是否为正确的方向
     quality: this.QUALITY_SIZE,//图像质量，范围为0 - 100
   * @param options
   */
  getPicture(options: CameraOptions = {}): Observable<string> {
    let ops: CameraOptions = Object.assign({
      sourceType: this.camera.PictureSourceType.CAMERA,//图片来源,CAMERA:拍照,PHOTOLIBRARY:相册
      destinationType: this.camera.DestinationType.FILE_URI,//默认返回base64字符串,DATA_URL:base64   FILE_URI:图片路径   
      allowEdit: false,//选择图片前是否允许编辑
      encodingType: this.camera.EncodingType.JPEG,
      saveToPhotoAlbum: false//是否保存到相册    
    }, options);
    return Observable.create(observer => {
      this.camera.getPicture(ops).then((fileUrl: string) => {
        if (ops.destinationType === this.camera.DestinationType.FILE_URI) {
          observer.next(fileUrl);
        } else {
          observer.next(null);
        }
      }).catch(err => {
        if (err == 20) {
          this.alert('没有权限,请在设置中开启权限');
          return;
        }
        if (String(err).indexOf('cancel') != -1) {
          return;
        }
        this.warn('getPicture:' + err);
        observer.error('获取照片失败');
      });
    });
  };

  /**
   * 通过拍照获取照片
   * @param options
   */
  getPictureByCamera(options: CameraOptions = {}): Observable<string> {
    let ops: CameraOptions = Object.assign({
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI//DATA_URL: 0 base64字符串, FILE_URI: 1图片路径
    }, options);

    if (this.isMobile()) {
      return this.getPicture(ops);
    } else {
      return Observable.create(observer => {
        //observer.next("file:///storage/emulated/0/Android/data/io.ionic.starter/cache/IMG_20170923_083830.jpg?1507518576763");
        observer.next("http://192.168.10.141:8002/test.jpg");
      });
    }

  };

  /**
   * 通过图库获取照片
   * @param options
   */
  getPictureByPhotoLibrary(options: CameraOptions = {}): Observable<string> {
    let ops: CameraOptions = Object.assign({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI//DATA_URL: 0 base64字符串, FILE_URI: 1图片路径
    }, options);

    if (this.isMobile()) {
      return this.getPicture(ops);
    } else {
      return Observable.create(observer => {
        //observer.next("file:///storage/emulated/0/Android/data/io.ionic.starter/cache/IMG_20170923_083830.jpg?1507518576763");
        var url = "http://192.168.10.141:8002/test.jpg";
        observer.next(url);
      });
    }
  };


  uploadPic(file: string, url: string): Observable<any> {
    if (this.isMobile()) {
      //var fileName = file.substring(file.lastIndexOf("\/") + 1, file.lastIndexOf("\?"));
      return Observable.create(observer => {
        let options1: FileUploadOptions = {
          fileKey: 'file',
          fileName: 'img.jpeg',
          headers: {}
        }


        const fileTransfer: FileTransferObject  = this.transfer.create();
        fileTransfer.upload(file, url, options1)
          .then((data) => {
            // success
            //observer.next("success");
            observer.next(data);
            console.log("success");
          }, (err) => {
            // error
            console.log("error" + JSON.stringify(err));
          });

      });
    } else {
      return Observable.create(observer => {
        observer.next({ bytesSent: 27099, responseCode: 200, response: "", objectId: "" });
      });
    }
  }

  /**
   * 获得用户当前坐标
   */
  // getUserLocation(): Observable<Position> {
  //   return Observable.create(observer => {
  //     if (this.isMobile()) {
  //       LocationPlugin.getLocation(data => {
  //         observer.next({ 'lng': data.longitude, 'lat': data.latitude, 'add': data.address, 'satellites': data.satellites, 'speed': data.speed });
  //       }, msg => {
  //         this.alert(msg.indexOf('缺少定位权限') == -1 ? ('错误消息：' + msg) : '缺少定位权限，请在手机设置中开启');
  //         this.warn('getUserLocation:' + msg);
  //         observer.error(msg);
  //       }, err => {
  //         observer.error(err);
  //       });
  //     } else {
  //       console.log('非手机环境,即测试环境返回固定坐标');
  //       observer.next({ 'lng': 120.350912, 'lat': 30.1, 'add': '浙江嘉兴南湖区', 'satellites': 3, 'speed': 9.9 });
  //     }
  //   });
  // }

  getLocation(): Observable<any> {
    
    if (this.isMobile()) {
      return Observable.create(observer=>{
        this.geolocation.getCurrentPosition().then(location=>{
          observer.next(location.coords);
        });
      })
    }else{
      return Observable.create(observer=>{
        // if (navigator.geolocation)
        // {
        //   navigator.geolocation.getCurrentPosition((position)=>{
        //     observer.next(position.coords);
        //   });
        // }
        // else{
          console.log('非手机环境,即测试环境返回固定坐标');
          observer.next({'longitude':120.094,'latitude':30.436,'accuracy':10});
        // } 
      });
    }
  }    
}                                                                                                                                               