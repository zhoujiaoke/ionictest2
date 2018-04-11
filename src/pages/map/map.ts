import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage, ToastController } from 'ionic-angular';
import { AppConfig } from '../../app/app.config';
import { leaflet as L } from "../../service/leaflet.expand";
import * as esri from 'esri-leaflet';
import { NativeServiceProvider } from "../../service/native.service";
import { Geolocation } from '@ionic-native/geolocation';
@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
  tubanurl: string = AppConfig.tubanurl;
  tubanid: string = "";
  map: any;
  imglayer: any;
  cialayer: any;
  locateclass = "map-locate";
  locateselected = false;
  polygon;
 // interval;
  mark;
  _mark;
  _polyline;
  polyline;
  tbload = false;
  watch;
  subscription;
  _loadResult: () => void;
  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, 
    public nativeService: NativeServiceProvider, private geolocation: Geolocation) {

    L.esri = esri;
    this.tubanid = this.navParams.get('tubanid');

    this.watch = this.geolocation.watchPosition({ enableHighAccuracy: true, timeout: 8000});
  }

  locate() {
    if (!this.locateselected) {
      this.locateclass = "map-locate selected";
      
      this.subscription = this.watch.subscribe(position => {
        if(position.coords !== undefined)
        this._drawLocation(position.coords,"red");
      });

    } else {
      this.locateclass = "map-locate";     
      // To stop notifications
      this.subscription.unsubscribe();
      
      this._mark.remove();
      this._mark = null;
      this._polyline.remove();
      this._polyline = null;

      this.map.fitBounds(this.polygon.getBounds());  
    }
    this.locateselected = !this.locateselected;
  }

  _drawLocation(resp,color){
    var point = L.latLng(resp.latitude, resp.longitude);

    if (this._mark) {
      this._mark.setLatLng(point);
    } else {
      this._mark = L.circleMarker(point, {color: color}).addTo(this.map);
    }
    var tubanpoint = this.polygon.getCenter();
    var latlngs = [
      [resp.latitude, resp.longitude],
      [tubanpoint.lat,tubanpoint.lng]
    ];
    if (this._polyline) {
      this._polyline.setLatLngs(latlngs);
    } else {
      this._polyline = L.polyline(latlngs, {color: 'red'}).addTo(this.map);
    }
    this.map.panTo(point);
  }

  ngOnDestroy() {
    if(this.subscription)
    this.subscription.unsubscribe();
  }

  ngAfterViewInit() {

    this.map = L.map('map', {
      center: [30.436, 120.094],
      zoom: 13,
      crs: L.CRS.EPSG4326
    });
    this.definelayer(13);

    this.map.on('zoomend zoomlevelschange', (e) => {
      // var zoom = e.target._animateToZoom;
      this.definelayer(e.target._zoom);
    });

    var tubanLayer = L.esri.dynamicMapLayer({
      url: this.tubanurl
    }).addTo(this.map);

    this.loadResult();
  }

  definelayer(zoom) {
    zoom = zoom + 1;
    AppConfig.wmts.forEach(item => {
      if (zoom >= item.minZoom && zoom <= item.maxZoom) {
        this.imglayer = L.tileLayer.wmts(item.img.url, {
          subdomains: "0123456",
          layer: item.img.layer,
          tilematrixSet: item.tilematrixSet,
          format: item.format,
          zOffset: 1
        }).addTo(this.map);
        this.cialayer = L.tileLayer.wmts(item.cia.url, {
          subdomains: "0123456",
          layer: item.cia.layer,
          tilematrixSet: item.tilematrixSet,
          format: item.format,
          zOffset: 1
        }).addTo(this.map);
      }
    });
  }

  loadResult() {
    var query = L.esri.query({
      url: this.tubanurl + '/0'
    });
    query.where("ID='" + this.tubanid + "'");

    query.run((error, featureCollection, response) => {
      console.log('Found ' + featureCollection.features.length + ' features');
      this.showResult(featureCollection);
    });
  }

  showResult(results) {
    var resultCount = results.features.length;
    if (resultCount == 0) {
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

      for (var j = 0; j < rings.length; j++) {
        var latlngs = rings[j];
        latlngs = latlngs.map(item => { return item.reverse() });
        this.polygon = L.polygon(latlngs, { color: 'yellow' }).addTo(this.map);
        var bounds = this.polygon.getBounds();
        // zoom the map to the polygon
        this.map.fitBounds(bounds);
      }

    }
    this.tbload = true;
  }
}