import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage,ToastController } from 'ionic-angular';
import { AppConfig } from '../../app/app.config';
//import * as L from 'leaflet';
import { leaflet as L } from "../../service/leaflet.expand";
import * as esri from 'esri-leaflet';

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
  tubanurl: string = AppConfig.tubanurl;
  tubanid: string = "";
  map:any;
  imglayer:any;
  cialayer:any;
  _loadResult:() => void;
  constructor(public navCtrl: NavController, public navParams: NavParams,public toastCtrl: ToastController) {

    L.esri = esri;
    this.tubanid = this.navParams.get('tubanid');
  }

  ngAfterViewInit() {
    
    this.map = L.map('map', {
      center: [30.436, 120.094],
      zoom: 13,
      crs:L.CRS.EPSG4326		
    });
    this.definelayer(13);

    this.map.on('zoomend zoomlevelschange', (e)=> {
     // var zoom = e.target._animateToZoom;
      this.definelayer(e.target._zoom);
    });

    // var mapLayer = L.tileLayer(AppConfig.Tianditu.Satellite.img, {
    //   subdomains: AppConfig.Tianditu.Subdomains,
    //   maxZoom: 18,
    //   minZoom: 1
    // }).addTo(this.map);

    // var maplabelLayer = L.tileLayer(AppConfig.Tianditu.Satellite.cia, {
    //   subdomains: AppConfig.Tianditu.Subdomains,
    //   maxZoom: 18,
    //   minZoom: 1
    // }).addTo(this.map);

    var tubanLayer = L.esri.dynamicMapLayer({
      url: this.tubanurl
    }).addTo(this.map);

    //this._loadResult = ()=>{this.loadResult();};
    //tubanLayer.on("load", this._loadResult);
    
    this.loadResult();
    
  }

  definelayer(zoom){
    zoom = zoom + 1;
    AppConfig.wmts.forEach(item => {
      if (zoom >= item.minZoom && zoom <= item.maxZoom) {
        this.imglayer =  L.tileLayer.wmts(item.img.url,{ 
          subdomains: "0123456",
          layer: item.img.layer,         
          tilematrixSet: item.tilematrixSet,
          format: item.format,
          zOffset:1
        }).addTo(this.map);
        this.cialayer =  L.tileLayer.wmts(item.cia.url,{ 
          subdomains: "0123456",
          layer: item.cia.layer,         
          tilematrixSet: item.tilematrixSet,
          format: item.format,
          zOffset:1
        }).addTo(this.map);
      }
    });
  }

  loadResult() {
    var query = L.esri.query({
      url: this.tubanurl + '/0'
    });
    query.where("ID='" + this.tubanid + "'");

    query.run((error, featureCollection, response)=>{
      console.log('Found ' + featureCollection.features.length + ' features');
      this.showResult(featureCollection);
    });
  }

  showResult(results){
    var resultCount = results.features.length;
    if (resultCount == 0)
    {
        //alert("找不到该ID所对应图斑");
        let toast = this.toastCtrl.create({
          message: "找不到该ID所对应图斑",
          duration: 3000,
          position: 'middle',
          showCloseButton: true,
          closeButtonText: '关闭'
        });
        toast.present();
        return;
    }
        
    for (var i = 0; i < resultCount; i++) {
       
        var rings = results.features[i].geometry.coordinates;
      
        for(var j = 0;j<rings.length;j++){
          var latlngs = rings[j];
          latlngs = latlngs.map(item=>{return item.reverse()});
          var polygon = L.polygon(latlngs, {color: 'yellow'}).addTo(this.map);
          var bounds = polygon.getBounds();
          // zoom the map to the polygon
          this.map.fitBounds(bounds);      
        }
      
    }
  }
}