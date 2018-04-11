export class AppConfig {
  static localMode: boolean = false;        //本地调试模式
  static _localAPIBaseURL: string = "http://localhost:8100";
  static localAPIBaseURL: string = "http://192.168.10.141:8002";
  static remoteAPIBaseURL: string = "http://yuhang.newgis.cn:8081";
  static tubanurl: string = "http://60.191.75.48:6080/arcgis/rest/services/yhtb/MapServer";
  static distance = 100;
  //APP信息
  static platform: string = '';          // android  ios
  static appName: string = '余杭区防违控违信息采集平台';

  static appVersion: string = '1.0';        //版本号

  //授权信息
  static expireDate: any = '2022.01.01';           //APP到期日期

  //地图
  public static Tianditu: any = {
    Vector: {
      vec: "http://t{s}.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}",
      cva: "http://t{s}.tianditu.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}",
    },
    Satellite: {
      img: "http://t{s}.tianditu.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}",
      cia: "http://t{s}.tianditu.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}",
    },
    Terrain: {
      ter: "http://t{s}.tianditu.cn/DataServer?T=ter_w&X={x}&Y={y}&L={z}",
      cta: "http://t{s}.tianditu.cn/DataServer?T=cta_w&X={x}&Y={y}&L={z}",
    },
    Subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
  };
  
  public static wmts: any = [
    {//18-20
      maxZoom: 20, minZoom: 18,
      tilematrixSet: "TileMatrixSet0",
      format: "image/png",
      img: {
        layer: "yhimgmap",
        url: "http://dt.yuhang.gov.cn/geocloud/wmts"
      },
      cia: {
        layer: "yhemapanno",
        url: "http://dt.yuhang.gov.cn/geocloud/wmts"
      }
    },
    {//15-17
      maxZoom: 17, minZoom: 15,
      tilematrixSet: "c",
      format: "image/tile",
      img: {
        layer: "ZJDOM2W1",
        url: "http://srv{s}.zjditu.cn/ZJDOM_2D/wmts"
      },    
      cia:{
        layer: "ZJIMGANNO",
        url: "http://srv{s}.zjditu.cn/ZJDOMANNO_2D/wmts"
      }, 
    },
    {
      maxZoom: 14, minZoom: 1,
      tilematrixSet: "c",
      format: "tiles",
      img:{
        layer: "img",
        url: "http://t{s}.tianditu.com/img_c/wmts"
      },          
      cia:{
        layer: "cia",
        url: "http://t{s}.tianditu.com/cia_c/wmts"
      }
    }
  ];

  //服务端基址
  public static getAPIBaseURL() {
    if (this.localMode) {
      return this.localAPIBaseURL;
    }
    else {
      return this.remoteAPIBaseURL;
    }
  }

  public static setDistance(distance){
    this.distance = distance;
  }

  //获取设备高度
  public static getWindowHeight() {

    return window.screen.height;
  }

  //获取设备宽度
  public static getWindowWidth() {
    return window.screen.width;
  }



}