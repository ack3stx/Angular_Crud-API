import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mantenimiento } from '../../models/mantenimiento';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1/Mantenimiento';

  constructor(private http: HttpClient) { }

  getMantenimientos(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(this.apiUrl);
  }
}