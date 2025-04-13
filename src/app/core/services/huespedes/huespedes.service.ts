import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Huesped } from '../../models/huesped';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HuespedesService {

  private url = environment.apiUrl + '/v1/Huesped';

  constructor(private http: HttpClient) { }

  getHuespedes(): Observable<Huesped[]> {
    return this.http.get<Huesped[]>(this.url);
  }

  getHuesped(id: number): Observable<Huesped> {
    return this.http.get<Huesped>(`${this.url}/${id}`);
  }

  createHuesped(huesped: Huesped): Observable<Huesped> {
    return this.http.post<Huesped>(this.url, huesped);
  }

  updateHuesped(id: number, huesped: Huesped): Observable<Huesped> {
    return this.http.put<Huesped>(`${this.url}/${id}`, huesped);
  }

  deleteHuesped(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}