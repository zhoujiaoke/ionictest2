import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { AppConfig } from '../app/app.config';



@Injectable()
export class LoginService {

	private headers = new Headers({ 'Content-Type': 'application/json' });
	private serviceUrl = AppConfig.getAPIBaseURL();

	constructor(private http: Http) { }

	getUserInfo(user) {
		const url = `${this.serviceUrl}/DataServer.asmx/CheckLogin`;
		return this.http.post(url, JSON.stringify(user), { headers: this.headers })
			.toPromise()
			.then(response => response)
			.catch(this.handleError);
	}

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}



}
