import { Injectable } from '@angular/core';
import { ToastController, LoadingController, Platform, Loading, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { AppUpdate } from '@ionic-native/app-update';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Observable } from "rxjs/Observable";
import { File } from '@ionic-native/file';
import 'blueimp-canvas-to-blob';
import { AppConfig } from '../app/app.config';

@Injectable()
export class NativeServiceProvider {
  private loading: Loading;
  private loadingIsOpen: boolean = false;
  private IMAGE_SIZE = 1024;
  constructor(private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private camera: Camera,
    private transfer: FileTransfer,
    private geolocation: Geolocation,
    private file: File,
    private appUpdate: AppUpdate,
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
   * 获得app版本号,如0.01
   * @description  对应/config.xml中version的值
   */

  checkAppUpdate(){
    const updateUrl = AppConfig.remoteAPIBaseURL + "/apk/update.xml";
    this.appUpdate.checkAppUpdate(updateUrl);
  }
  /**
   * 检查app是否需要升级
   */
  detectionUpgrade(): void {
    //这里连接后台判断是否需要升级,不需要升级就return
    this.alertCtrl.create({
      title: '升级',
      subTitle: '发现新版本,是否立即升级？',
      buttons: [{ text: '取消' },
      {
        text: '确定',
        handler: () => {
          this.downloadApp();
        }
      }
      ]
    }).present();
  }

  /**
   * 下载安装app
   */
  downloadApp(): void {
    if (this.isAndroid()) {
      let alert = this.alertCtrl.create({
        title: '下载进度：0%',
        enableBackdropDismiss: false,
        buttons: ['后台下载']
      });
      alert.present();

      const fileTransfer: FileTransferObject = this.transfer.create();
      const apk =  this.file.externalRootDirectory + 'YHFWKW.apk'; //apk保存的目录
      const APK_DOWNLOAD = AppConfig.remoteAPIBaseURL + "/apk/YHFWKW.apk";
      fileTransfer.download(APK_DOWNLOAD, apk).then(() => {
        window['install'].install(apk.replace('file://', ''));
      });

      fileTransfer.onProgress((event: ProgressEvent) => {
        let num = Math.floor(event.loaded / event.total * 100);
        if (num === 100) {
          alert.dismiss();
        } else {
          let title = document.getElementsByClassName('alert-title')[0];
          title && (title.innerHTML = '下载进度：' + num + '%');
        }
      });
    }
    
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
     correctOrientation: true,//设置摄像机拍摄的图像是否为正确的方向
     quality: this.QUALITY_SIZE,//图像质量，范围为0 - 100
   * @param options
   */
  getPicture(options: CameraOptions = {}): Observable<string> {
    let ops: CameraOptions = Object.assign({
      sourceType: this.camera.PictureSourceType.CAMERA,//图片来源,CAMERA:拍照,PHOTOLIBRARY:相册
      destinationType: this.camera.DestinationType.FILE_URI,//base64字符串,DATA_URL:base64   FILE_URI:图片路径   NATIVE_URI
      allowEdit: false,//选择图片前是否允许编辑
      encodingType: this.camera.EncodingType.JPEG,
      saveToPhotoAlbum: false//是否保存到相册    
    }, options);
    return Observable.create(observer => {
      this.camera.getPicture(ops).then((fileUrl: string) => {
        if (ops.destinationType === this.camera.DestinationType.FILE_URI) {
          observer.next(fileUrl);
        }
        else if (ops.destinationType === this.camera.DestinationType.NATIVE_URI) {
          this.file.resolveLocalFilesystemUrl(fileUrl).then((fileEntry)=>{
            observer.next(fileEntry.toInternalURL());
          });        
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
      targetWidth: this.IMAGE_SIZE,//缩放图像的宽度（像素）
      targetHeight: this.IMAGE_SIZE,//缩放图像的高度（像素）
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      saveToPhotoAlbum: true//是否保存到相册    
    }, options);

    if (this.isMobile()) {
      return this.getPicture(ops);
    } else {
      return Observable.create(observer => {
        observer.next("http://192.168.10.141:8002/test.jpg");
      });
    }

  };

  /**
   * 通过图库获取照片
   * @param options
   */
  getPictureByPhotoLibrary(hasTB, options: CameraOptions = {}): Observable<string> {
    let ops: CameraOptions = Object.assign({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI
    }, options);

    if (this.isIos() && hasTB == 1) {
      ops.destinationType = this.camera.DestinationType.NATIVE_URI;
    }
    if (hasTB != 1) {
      ops.targetWidth = this.IMAGE_SIZE;//缩放图像的宽度（像素）
      ops.targetHeight = this.IMAGE_SIZE;//缩放图像的高度（像素）
    }
    if (this.isMobile()) {
      return this.getPicture(ops);
    } else {
      return Observable.create(observer => {
        var url = "http://192.168.10.141:8002/test.jpg";
        observer.next(url);
      });
    }
  };


  uploadPic(file: string, url: string): Observable<any> {
    if (this.isMobile()) {      
      return Observable.create(observer => {
        let options1: FileUploadOptions = {
          fileKey: 'file',
          fileName: 'img.jpeg',
          headers: {}
        }
        const fileTransfer: FileTransferObject = this.transfer.create();
        fileTransfer.upload(file, url, options1)
          .then((data) => {
            // success
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

  getLocation(): Observable<any> {

    if (this.isMobile()) {
      return Observable.create(observer => {
        this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 }).then(location => {
          observer.next(location.coords);
        });
      })
    } else {
      return Observable.create(observer => {       
        console.log('非手机环境,即测试环境返回固定坐标');
        observer.next({ 'longitude': 120.094, 'latitude': 30.436, 'accuracy': 10 });     
      });
    }
  }

  //压缩图片并返回图片地址
  compressPic(fileUrl): Observable<string> {

    return Observable.create(observer => {

      var maxWidth = this.IMAGE_SIZE;
      var maxHeight = this.IMAGE_SIZE;
      var file = this.file;

      var img = document.createElement("img");

      img.onload = function () {

        // 图片原始尺寸
        var originWidth = img.width;
        var originHeight = img.height;      

        // 目标尺寸
        var targetWidth = originWidth, targetHeight = originHeight;
        // 图片尺寸超过400x400的限制
        if (originWidth > maxWidth || originHeight > maxHeight) {
          if (originWidth / originHeight > maxWidth / maxHeight) {
            // 更宽，按照宽度限定尺寸
            targetWidth = maxWidth;
            targetHeight = Math.round(maxWidth * (originHeight / originWidth));
          } else {
            targetHeight = maxHeight;
            targetWidth = Math.round(maxHeight * (originWidth / originHeight));
          }
        }
        // 缩放图片需要的canvas
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        // canvas对图片进行缩放
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        // 清除画布
        context.clearRect(0, 0, targetWidth, targetHeight);
        // 图片压缩
        context.drawImage(img, 0, 0, targetWidth, targetHeight);

        // canvas转为blob toBlob有兼容性问题
        canvas.toBlob((blob) => {

          file.createFile(file.dataDirectory, 'yhfwkw.jpg', true).then((fileEntry) => {                     
            file.writeExistingFile(file.dataDirectory, 'yhfwkw.jpg', blob).then(()=>{
              observer.next(fileEntry.toInternalURL());
            });
          });

        },
        'image/jpeg');
      }
      img.src = fileUrl;
      });
  }

}                                                                                                                                               