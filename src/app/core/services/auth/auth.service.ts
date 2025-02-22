import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginCredentials } from '../../models/login-credentials';


@Injectable({
  providedIn: 'root',
  deps: [HttpClient]
})
export class AuthService {
  
  private apiUrl = 'http://127.0.0.1:8000/api/v1/login';

  constructor(private http: HttpClient) { }

  login(credentials: LoginCredentials): Observable<any> {
    return this.http.post(this.apiUrl, credentials);
  }
}