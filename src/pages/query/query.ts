import { Component } from '@angular/core';
import { NavController, NavParams,IonicPage,Events} from 'ionic-angular';
import { Query} from '../../model/query';

import { StorageService } from "../../service/storage.service";
import { HomeService } from "../../service/home.service";
@IonicPage()
@Component({
  selector: 'page-query',
  templateUrl: 'query.html'
})
export class QueryPage {
  query:Query;
  years:Array<string>;
  sources:Array<string>;
  constructor(public navCtrl: NavController, public navParams: NavParams, private storageService:StorageService, private homeService:HomeService,
    public events: Events) {
    if (this.storageService.read("yhqueryinfo") != null) {
      this.query = this.storageService.read("yhqueryinfo");
    } else {
      this.query = new Query();
      this.query.iDisplayStart = 0;
      this.query.iDisplayLength = 20;
    }   
    this.years = new Array<string>();
    this.sources = new Array<string>();

    this.getYears();
    this.getSources();  
  }
 
  getYears(){
    return this.homeService.GetYears().then(
      response => {//返回值多出 {"d":null}
        var json = JSON.parse(response._body.replace('{"d":null}', ""));
        for(var i = 0;i<json.length;i++){
          this.years.push(json[i].DATA_YEAR);
        }
    });      
  }
  getSources(){
    return this.homeService.GetSources().then(
      response => {//返回值多出 {"d":null}
        var json = JSON.parse(response._body.replace('{"d":null}', ""));
        this.sources = json;
    }); 
  }
  
  onquery(){
    //var b = this.navCtrl.canGoBack();
    this.storageService.write("yhqueryinfo",this.query);
    this.events.publish('onquery');
    this.navCtrl.parent.select(0);

  }
 
}