import { Component } from '@angular/core';
import { NavController, IonicPage} from 'ionic-angular';


@IonicPage()
@Component({
	selector: 'page-tabs',
	templateUrl: 'tabs.html'
})

export class TabsPage {
    tabRoots: Object[];
    constructor(public navCtrl: NavController) {
        this.tabRoots = [           
            {
              root: "ListPage",
              tabTitle: '列表',
              tabIcon: 'list'
            },
            {
              root: "QueryPage",
              tabTitle: '查询',
              tabIcon: 'search'
            }
          ];
    }
        
}