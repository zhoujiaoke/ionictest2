import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
//import { TabsPage } from '../pages/tabs/tabs';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = "LoginPage";

  pages: Array<{ title: string, component: any }>;

  constructor(private alertCtrl: AlertController, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'List', component: "ListPage" }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.registerBackButtonAction();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  registerBackButtonAction() {
    this.platform.registerBackButtonAction((e) => {
      //阻止默认的行为
      //e.preventDefault();

      //alert("in");
      if (!this.nav.canGoBack()) {
        //alert("检测到在根视图点击了返回按钮");
        this.showConfirm();
      }
      else {
        //alert("检测到在子路径中点击了返回按钮。");
        this.nav.pop();
      }

      return false;
    });
  }

  showConfirm() {
    //alert("inshowConfirm");
    let confirm = this.alertCtrl.create({
      title: '提示?',
      message: '确定要退出应用吗?',
      buttons: [
        {
          text: '取消',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: '确认',
          handler: () => {
            console.log('Agree clicked');
            this.platform.exitApp();
          }
        }
      ]
    });
    confirm.present();
  }
}
