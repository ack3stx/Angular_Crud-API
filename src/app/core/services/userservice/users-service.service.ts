import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  disableUser(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/desabilitar`, { email });
  }

  enableUser(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/activar`, { email });
  }
}