import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habitacion } from '../../models/habitacion';

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/Habitacion';

  constructor(private http: HttpClient) { }

  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.apiUrl);
  }

  nuevaHabitacion(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  actualizarHabitacion(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${data.id}`, data);
  }

  eliminarHabitacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}