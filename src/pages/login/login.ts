import { Component } from '@angular/core';
import { NavController, ToastController, IonicPage} from 'ionic-angular';
import { StorageService } from "../../service/storage.service";
import { LoginService } from "../../service/login.service";

//import { ListPage } from '../list/list';
import { User } from '../../model/user';

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
	//private soapService: SoapService;
	//private responseJso: {} = null;
	//private targetNamespace: string = '';
	constructor(public navCtrl: NavController, public toastCtrl: ToastController, private storageService: StorageService, private loginService: LoginService) { }

	ngOnInit() {
		//localStorage.clear();
		if (this.storageService.read("yhuser") != null) {
			this.user = this.storageService.read("yhuser");
		} else {
			this.user = new User();
		}

	}
	login(){
		//var b = this.navCtrl.canGoBack();
		this.loginService.getUserInfo(this.user).then(
			response => {//返回值多出 {"d":null}
				var json = JSON.parse(response._body.replace('{"d":null}',""));
				if(json.result){
					this.user.realname = json.realname;
					AppConfig.setDistance(parseInt(json.distance));
					this.storageService.write("yhuser", this.user);
					this.navCtrl.setRoot("TabsPage");
				}else{
					let toast = this.toastCtrl.create({
					message: json.Message,
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

	testlocate(){
		this.navCtrl.push("TestlocatePage");
	}

	login_() {
		var xmlHttp: XMLHttpRequest = new XMLHttpRequest();
		xmlHttp.onreadystatechange = () => {
			if (4 == xmlHttp.readyState) {
				if ((xmlHttp.status >= 200 && xmlHttp.status < 300) || xmlHttp.status == 304) {
									
					var response = JSON.parse(xmlHttp.responseText);
					if (response.result) {
						this.storageService.write("yhuser", this.user);
						this.navCtrl.setRoot("TabsPage");
					} else {
						let toast = this.toastCtrl.create({
							message: xmlHttp.response.Message,
							duration: 3000,
							position: 'middle',
							showCloseButton: true,
							closeButtonText: '关闭'
						});
						toast.present();
					}
				}
			}
		};

		xmlHttp.open("POST", this.serviceUrl+"/DataServer.asmx/CheckLogin", true);
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		var data = 'username='+this.user.username+'&password='+this.user.password;
		xmlHttp.send(data);
	}	

///////////////////////////////////////////////////////////////////////////////////////////////

	checklogin() {
		// var method: string = 'CheckLogin';
		// var parameters: {}[] = [];
		// parameters['CheckLogin xmlns="http://tempuri.org/"'] = this.userLogin(this.user.username, this.user.password);

		// this.soapService = new SoapService(this.serviceUrl, "/DataServer.asmx/CheckLogin", this.targetNamespace);
		// this.soapService.envelopeBuilder = this.envelopeBuilder;
		// this.soapService.jsoResponseHandler = (response: {}) => {
		// 	this.responseJso = response;
			

		// };
		// this.soapService.post(method, parameters);
	}

	userLogin(username, password): {}[] {
		var parameters: {}[] = [];

		parameters["username"] = username;
		parameters['password'] = password;

		return parameters;
	}

	envelopeBuilder(requestBody: string): string {
		return "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
			"<SOAP-ENV:Body>" +
			requestBody +
			"</SOAP-ENV:Body>" +
			"</SOAP-ENV:Envelope>";
	}

}