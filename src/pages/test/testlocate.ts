import { Component } from '@angular/core';
import { NavController, ToastController, IonicPage } from 'ionic-angular';
//import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
import { AppConfig } from '../../app/app.config';
import { NativeServiceProvider } from "../../service/native.service";
import { leaflet as L } from "../../service/leaflet.expand";

@IonicPage()
@Component({
    selector: 'page-testlocate',
    templateUrl: 'testlocate.html'
})

export class TestlocatePage {
    map;
    interval;
    mark;
    constructor(public navCtrl: NavController, public nativeService: NativeServiceProvider) {
        L.esri = esri;
    }
    ngAfterViewInit() {

        //this.addwmts();
        this.map2();
        this.interval = setInterval(() => {
            this.getLocation();
        }, 3000);

    }

    ngOnDestroy() {
        console.log("clearInterval");
        clearInterval(this.interval);
    }
    
    map1(){
        this.map = L.map('map', {
            center: [30, 120],
            zoom: 13
        });

        var mapLayer = L.tileLayer(AppConfig.Tianditu.Vector.vec, {
            subdomains: AppConfig.Tianditu.Subdomains,
            maxZoom: 18,
            minZoom: 1
        }).addTo(this.map);

        var maplabelLayer = L.tileLayer(AppConfig.Tianditu.Vector.cva, {
            subdomains: AppConfig.Tianditu.Subdomains,
            maxZoom: 18,
            minZoom: 1
        }).addTo(this.map);

    }
    map2(){
        this.map = L.map('map', {
            center: [30, 120],
            zoom: 13,
            crs:L.CRS.EPSG4326		
          });

         var imglayer =  L.tileLayer.wmts(AppConfig.wmts[2].img.url,{ 
          subdomains: "0123456",
          layer: AppConfig.wmts[2].img.layer,         
          tilematrixSet: AppConfig.wmts[2].tilematrixSet,
          format: AppConfig.wmts[2].format,
          zOffset:1
        }).addTo(this.map);

        var cialayer =  L.tileLayer.wmts(AppConfig.wmts[2].cia.url,{ 
          subdomains: "0123456",
          layer: AppConfig.wmts[2].cia.layer,         
          tilematrixSet: AppConfig.wmts[2].tilematrixSet,
          format: AppConfig.wmts[2].format,
          zOffset:1
        }).addTo(this.map);

    }
    getLocation() {

        this.nativeService.getLocation().subscribe((resp) => {
            if (resp) {
                var point = L.latLng(resp.latitude,resp.longitude);
                //position.coords.longitude
                if(this.mark){
                    this.mark.setLatLng(point);                 
                }else{
                    this.mark = L.circleMarker(point).addTo(this.map);
                }
                this.map.panTo(point);
                
            }
        });
    }

    addwmts(){
        L.TileLayer.WMTS = L.TileLayer.extend({
          options: {
              version: '1.0.0',
              style: 'default',
              tilematrixSet: '',
              format: 'image/png',
              tileSize: 256,
              matrixIds: null,
              layer: '',
          },
          //todo 自动获取Capabilities
          initialize: function (url, options) { // (String, Object)
              this._url = url;
              L.setOptions(this, options);
          },
          getTileUrl: function (coords) { // (Point, Number) -> String
              var zoom = this._getZoomForUrl();
              if (this.options.zOffset)
                  zoom = zoom + this.options.zOffset;
      
              var ident = this.options.matrixIds ? this.options.matrixIds[zoom].identifier : zoom;
              var url = L.Util.template(this._url, { s: this._getSubdomain(coords) });
              var obj = {
                  service: 'WMTS',
                  request: 'GetTile',
                  version: this.options.version,
                  style: this.options.style,
                  tilematrixSet: this.options.tilematrixSet,
                  format: this.options.format,
                  width: this.options.tileSize,
                  height: this.options.tileSize,
                  layer: this.options.layer,
                  tilematrix: ident,
                  tilerow: coords.y,
                  tilecol: coords.x
              };
              return url + L.Util.getParamString(obj, url);
          }
      });
      
      L.tileLayer.wmts = function (url, options) {
          return new L.TileLayer.WMTS(url, options);
      };
      }


}