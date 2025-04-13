import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterCredentials } from '../../models/register-credentials';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private apiUrl = environment.apiUrl + '/v1/register';

  
  constructor(private http: HttpClient) { }
  
  register(registerdata: RegisterCredentials): Observable<any> {
    return this.http.post<any>(this.apiUrl, registerdata);
  }
}