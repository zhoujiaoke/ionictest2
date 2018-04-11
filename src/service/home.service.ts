import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { AppConfig } from '../app/app.config';

@Injectable()
export class HomeService {

	private headers_json = new Headers({ 'Content-Type': 'application/json' });
	private headers_form = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });

	private serviceUrl = AppConfig.getAPIBaseURL();

	constructor(private http: Http) { }

	// 查询
	GetTBList(query) {
		let url = `${this.serviceUrl}/DataServer.asmx/GetTBList`;
		return this.http.post(url, JSON.stringify(query), { headers: this.headers_json })
			.toPromise()
			.then(response => response)
			.catch(this.handleError);
	}
	//年份
	GetYears() {
		let url = `${this.serviceUrl}/DataServer.asmx/GetYearList`;
		return this.http.get(url)
			.toPromise()
			.then(response => response)
			.catch(this.handleError);
	}
	//事件来源
	GetSources() {
		let url = `${this.serviceUrl}/DataServer.asmx/GetLaiyuan`;
		return this.http.get(url)
			.toPromise()
			.then(response => response)
			.catch(this.handleError);
	}

	//现场照片
	GetXCZP_Base64(id) {
		let url = `${this.serviceUrl}/DataServer.asmx/GetXCZP_Base64?sId=${id}`;
		return this.http.get(url)
			.toPromise()
			.then(response => response)
			.catch(this.handleError);
	}

	//现场照片
	GetDZXCZP_Base64(id,index) {
		let url = `${this.serviceUrl}/DataServer.asmx/GetDZXCZP_Base64?sId=${id}&&index=${index}`;
		return this.http.get(url)
			.toPromise()
			.then(response => response)
			.catch(this.handleError);
	}

	//比对照片
	GetBDZP_Base64(id) {
		let url = `${this.serviceUrl}/DataServer.asmx/GetBDZP_Base64?sId=${id}`;
		return this.http.get(url)
			.toPromise()
			.then(response => response)
			.catch(this.handleError);
	}

	///// 更新图斑信息，包括当事人，地点描述，占地面积
	UpdateTBInfo(item){
		let url = `${this.serviceUrl}/DataServer.asmx/SubmitPhoto`;
		let pram = `ID=${item.id}&dangshiren=${item.person}&area=${item.zhandimj}&jianzhumj=${item.jianzhumj}&spotDescrible=${item.didianms}`;
		return this.http.post(url, pram, { headers: this.headers_form })
			.toPromise()
			.then(response => response)
			.catch(this.handleError);
	}

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

}
