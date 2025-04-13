import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.apiUrl + '/v1';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  disableUser(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/desabilitar`, { email });
  }

  enableUser(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/activar`, { email });
  }

  changeToAdmin(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cambiarrol/${id}`, {});
  }

  changeToUser(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/quitarrol/${id}`, {});
  }

  updateUser(id: number, data: { name?: string, email?: string, password?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data);
  }

  darrolguest(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/guestrol/${id}`, {});
  }


}