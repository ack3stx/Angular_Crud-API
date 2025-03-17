import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Huesped } from '../../models/huesped';

@Injectable({
  providedIn: 'root'
})
export class HuespedesService {
  private url = 'http://127.0.0.1:8000/api/v1/Huesped';

  constructor(private http: HttpClient) { }

  // Crear nuevo huésped
  nuevoHuesped(huesped: Huesped): Observable<Huesped> {
    return this.http.post<Huesped>(this.url, huesped);
  }

  // Obtener información del huésped actual
  getHuespedActual(): Observable<Huesped> {
    return this.http.get<Huesped>(`${this.url}/actual`);
  }

  // Actualizar información del huésped
  actualizarHuesped(huesped: Huesped): Observable<Huesped> {
    return this.http.put<Huesped>(`${this.url}/actual`, huesped);
  }


  getHuespedes(): Observable<Huesped[]> {
    return this.http.get<Huesped[]>(this.url);
  }
}