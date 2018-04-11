import { Component } from '@angular/core';
import { NavController, ToastController, IonicPage} from 'ionic-angular';
import { StorageService } from "../../service/storage.service";
import { LoginService } from "../../service/login.service";
import { User } from '../../model/user';
import { NativeServiceProvider } from "../../service/native.service";
import { AppConfig } from '../../app/app.config';


@IonicPage()
@Component({
	selector: 'page-login',
	templateUrl: 'login.html',
	providers: [LoginService]
})

export class LoginPage {
	user: User;
	private serviceUrl = AppConfig.getAPIBaseURL();
	
	constructor(public navCtrl: NavController, public toastCtrl: ToastController, private storageService: StorageService, 
		private loginService: LoginService, public nativeService: NativeServiceProvider) { }

	ngOnInit() {				
		if (this.storageService.read("yhuser") != null) {
			this.user = this.storageService.read("yhuser");
		} else {
			this.user = new User();
		}
	}
	login(){		
		this.loginService.getUserInfo(this.user).then(
			response => {//返回值多出 {"d":null}
				var json = JSON.parse(response._body.replace('{"d":null}',""));
				if(json.result){
					this.user.realname = json.realname;
					AppConfig.setDistance(parseInt(json.distance));
					this.storageService.write("yhuser", this.user);
					//判断升级
					this.nativeService.checkAppUpdate();
					this.navCtrl.setRoot("TabsPage");					
				}else{
					let toast = this.toastCtrl.create({
					message: json.msg,
					duration: 3000,
					position: 'middle',
					showCloseButton: true,
					closeButtonText: '关闭'
				  });
				  toast.present();
				} 		
			}
		)
	}	
}