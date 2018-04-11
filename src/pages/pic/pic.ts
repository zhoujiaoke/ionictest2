import { Component } from '@angular/core';
import { ViewController, NavParams, IonicPage} from 'ionic-angular';


@IonicPage()
@Component({
	selector: 'page-pic',
	templateUrl: 'pic.html'
})

export class PicPage {
    picurl = "";
    constructor(public viewCtrl: ViewController,private navParams: NavParams) {
        this.picurl = this.navParams.data.src;
    }

    close() {
        this.viewCtrl.dismiss();
    }
        
}