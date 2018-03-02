import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage, ToastController, ActionSheetController, Events, LoadingController } from 'ionic-angular';
import { Item } from '../../model/item';
import { Query } from '../../model/query';
import { HomeService } from "../../service/home.service";
import { NativeServiceProvider } from "../../service/native.service";
//import { query } from '@angular/core/src/animation/dsl';
import { AppConfig } from '../../app/app.config';
//import { Observable } from "rxjs/Observable";
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import * as EXIF from 'exif-js';
@IonicPage()
@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html'
})
export class DetailPage {
  item: Item;
  itemid: string;
  hasTB: Number;
  query: Query;
  interval: any;
  tubanurl: string;
  point: L.latLng = null;
  canpic: boolean = false;
  showpic: boolean = false;
  location: string;
  hasquerytb = false;
  uppicurl: string = "";
  tip: string = "";
  canedit: boolean = false;
  loading;
  loadingIsOpen;
  constructor(public navCtrl: NavController, public navParams: NavParams, private homeService: HomeService, public toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController, public nativeService: NativeServiceProvider, public events: Events, private loadingCtrl: LoadingController) {
    L.esri = esri;
    this.item = new Item();
    this.itemid = this.navParams.get("itemid");
    this.hasTB = this.navParams.get("hasTB");
    var jingduid = this.navParams.get("jinduid");
    if (jingduid == '2' || jingduid == '4' || jingduid == '5' || jingduid == '6') {
      this.canedit = true;
    }
    if (this.itemid == "D53494")
      this.hasTB = 1;//模拟数据
  }
  ngOnInit() {
    this.tubanurl = AppConfig.tubanurl;

    this.queryItem();
    if (this.canedit) {
      if (this.hasTB == 1) {
        //获取图斑，定位并计算距离差
        this.getTB();

        this.interval = setInterval(() => {
          this.getLocation();
        }, 10000);

      } else {
        this.showpic = true;
        this.nativeService.showToast("可以拍照");
      }
    }
    //var b = this.navCtrl.canGoBack();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  getTB() {
    var query = L.esri.query({
      url: this.tubanurl + '/0'
    });
    query.where("ID='" + this.itemid + "'");

    query.run((error, featureCollection, response) => {
      this.hasquerytb = true;

      if (featureCollection.features.length != 0) {
        var rings = featureCollection.features[0].geometry.coordinates;
        var latlngs = rings[0];
        latlngs = latlngs.map(item => { return item.reverse() });

        // 计算图斑中心
        var map = L.map('map', {
          center: [30, 120],
          zoom: 13,
        });
        var mapLayer = L.tileLayer(AppConfig.Tianditu.Vector.vec, {
          subdomains: AppConfig.Tianditu.Subdomains,
        });
        mapLayer.on("add", () => {
          var polygon = L.polygon(latlngs).addTo(map);;
          this.point = polygon.getCenter();
          this.getLocation();
          this.showpic = true;
        });
        mapLayer.addTo(map);

        setTimeout(() => {
          if (!this.point) {
            this.point = L.latLng(latlngs[0]);
            this.getLocation();
            this.showpic = true;
          }
        }, 3000);

      } else {
        this.nativeService.showToast("未找到图斑。");
      }
    });

  }

  getLocation() {
    if (this.hasquerytb && this.point == null) {
      clearInterval(this.interval);
      return;
    }
    if (this.point != null) {
      this.nativeService.getLocation().subscribe((resp) => {
        if (resp) {
          //position.coords.longitude
          this.locateSuccess(resp);
        }
      });
    }
  }

  locateSuccess(locate) {
    this.location = locate.longitude + "_" + locate.latitude;
    let accuracy = locate.accuracy;
    let distance = this.point.distanceTo(L.latLng([locate.latitude, locate.longitude]));
    if (distance <= AppConfig.distance) {
      if (!this.canpic) {
        this.canpic = true;
        this.nativeService.showToast("精度: " + Math.floor(accuracy) + ", 可以拍照");
      }
    } else {
      this.canpic = false;
      this.nativeService.showToast(" 精度: " + Math.floor(accuracy) + ", 距离图斑 " + Math.floor(distance) + " 米, 未满足拍照要求.", 2000, 'bottom');//"当前位置：" + this.location  + 
    }
  }


  queryItem() {
    this.query = new Query();
    this.query.iDisplayStart = 0;
    this.query.iDisplayLength = 1;
    this.query.id = this.itemid;
    this.homeService.GetTBList(this.query).then(
      response => {//返回值多出 {"d":null}
        var json = JSON.parse(response._body.replace('{"d":null}', ""));
        if (json.data) {
          this.item = json.data[0] as Item;
        }
      }
    )
  }

  submit() {
    this.homeService.UpdateTBInfo(this.item).then(
      response => {//返回值多出 {"d":null}
        var json = JSON.parse(response._body.replace('{"d":null}', ""));
        if (json.result) {
          this.nativeService.showToast(json.msg);
        }
      }
    )
  }

  addPhoto() {
    // let options = {
    //   targetWidth: 400,
    //   targetHeight: 400
    // };
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: '拍摄',
          handler: () => {
            //判断是否满足拍照要求
            if (this.hasTB == 1 && !this.canpic) {
              this.nativeService.showToast("距离未满足拍照要求或手机还未完成定位", 5000);
              return;
            }
            this.nativeService.getPictureByCamera().subscribe(fileUrl => {
              this.uppicurl = fileUrl;
              this.uploadpic(fileUrl);
            });
          }
        },
        {
          text: '从手机相册选择',
          handler: () => {
            this.nativeService.getPictureByPhotoLibrary().subscribe(fileUrl => {
              this.uppicurl = fileUrl;
              //判断照片是否满足要求
              if (this.hasTB == 1) {
                this.picFillBill();
                this.events.subscribe('picfill', () => {
                  this.uploadpic(fileUrl);
                });
              }
              else {
                this.uploadpic(fileUrl);
              }
            });
            console.log('Archive clicked');
          }
        },
        {
          text: '取消',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }

  uploadpic(fileUrl) {
    let upurl = AppConfig.getAPIBaseURL() + "/DataServer.asmx/UploadPhoto?id=" + this.item.id + "&location=" + this.location + "&user=";
    this.tip = "照片上传中...";
    this.loading = this.loadingCtrl.create({
      content: "照片上传中"
    });
    this.loading.present();
    this.loadingIsOpen = true;
    setTimeout(() => {//最长显示2分钟
      this.loadingIsOpen && this.loading.dismiss();
      this.loadingIsOpen = false;
    }, 120000);
    this.nativeService.uploadPic(fileUrl, upurl).subscribe(data => {
      this.loadingIsOpen = false;
      this.loading.dismiss();
      let json = JSON.parse(data.response);
      if (json && json.success) {
        this.nativeService.showToast("上传照片成功.", 5000);
        this.tip = "上传照片成功.";
      } else {
        this.nativeService.showToast("上传照片失败.", 5000);
        this.tip = "上传照片失败.";
      }
    });
  }

  picFillBill() {

    //var uppic = document.getElementById("uppic");
    var uppic = document.createElement("img");
    uppic.onload = () => {
      this.exif(uppic);
    };
    uppic.src = this.uppicurl;
  }

  exif(uppic) {
    var point = this.point;
    var _toast = (msg) => { this.nativeService.showToast(msg, 5000) };
    var _publish = () => { this.events.publish('picfill'); }
    //var data;
    EXIF.getData(uppic, function () {

      function _GPS2Decimal(numberArray) {
        return numberArray[0].numerator + numberArray[1].numerator /
          (60 * numberArray[1].denominator) + numberArray[2].numerator / (3600 * numberArray[2].denominator)
      }

      var data = EXIF.getAllTags(this);
      if (!data) return false;
      //alert(JSON.stringify(data));
      if (data.GPSLongitude && data.GPSLatitude) {
        var lat = data.GPSLatitude;
        var lon = data.GPSLongitude;
        //Convert coordinates to WGS84 decimal
        var latRef = data.GPSLatitudeRef || "N";
        var lonRef = data.GPSLongitudeRef || "W";
        lat = _GPS2Decimal(lat) * (latRef == "N" ? 1 : -1);
        lon = _GPS2Decimal(lon) * (lonRef == "W" ? -1 : 1);

        if (point) {
          let distance = point.distanceTo(L.latLng([lat, lon]));
          if (distance <= AppConfig.distance) {
            _toast("距离图斑:" + Math.floor(distance) + "米，照片满足要求.");
            _publish();
          }
          else {
            _toast("距离图斑:" + Math.floor(distance) + "米，照片未满足要求，上传图片失败");
          }
        }
      }
      else {
        _toast("图片没有获取到坐标信息，上传图片失败");
      }
    });
  }

}