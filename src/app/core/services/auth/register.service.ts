import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterCredentials } from '../../models/register-credentials';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/register';

  constructor(private http: HttpClient) { }

  register(registerdata: RegisterCredentials): Observable<any> {
    return this.http.post<any>(this.apiUrl, registerdata);
  }
}