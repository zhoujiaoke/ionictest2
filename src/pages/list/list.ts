import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage,Events,App} from 'ionic-angular';
import { Item } from '../../model/item';
import { Query } from '../../model/query';

import { StorageService } from "../../service/storage.service";
import { HomeService } from "../../service/home.service";

@IonicPage()
@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  query: Query;
  items: Array<Item>;
  completed;
  _init:() => void;
  constructor(public navCtrl: NavController, public navParams: NavParams, private storageService: StorageService, private homeService: HomeService,
    public events: Events,public app: App) {   
    this._init = ()=>{this.init();};
    this.events.subscribe('onquery',this._init);
    this.init();
  }

  init(){
    this.completed = false;
    this.items = new Array<Item>();
    this.resetQuery();
    this.getList();
  }
  resetQuery(){
    if (this.storageService.read("yhqueryinfo") != null) {
      this.query = this.storageService.read("yhqueryinfo");
    } else {
      this.query = new Query();    
      this.query.iDisplayLength = 20;
    }
    this.query.iDisplayStart = 0;
  }
 
  doInfinite(infiniteScroll) {
    if (!this.completed) this.getList().then(() => { infiniteScroll.complete() });
    else infiniteScroll.complete();
  }
  doRefresh(refresher) {
    this.query.iDisplayStart = 0;
    this.items = new Array<Item>();
    this.getList().then(() => { refresher.complete() });
  }

  getList() {
    return this.homeService.GetTBList(this.query).then(
      response => {//返回值多出 {"d":null}
        var json = JSON.parse(response._body.replace('{"d":null}', ""));
        if (json.data) {
          if (json.data.length == this.query.iDisplayLength) {
            this.query.iDisplayStart = Number(this.query.iDisplayStart) + Number(this.query.iDisplayLength);
          } else {
            this.completed = true;
          }
          this.items = this.items.concat(json.data);
        }
      }
    )
  }

  gotoMap(tubanid,$event){
    $event.stopPropagation();
    this.app.getRootNav().push("MapPage",{
      tubanid:tubanid
    });
  }

  gotoDetail(itemid,num,jinduid){
    let hasTB = -1;
    if(num != "0") hasTB = 1
    this.app.getRootNav().push("DetailPage",{
      itemid:itemid,
      hasTB:hasTB,
      jinduid:jinduid
    });
  }



}
