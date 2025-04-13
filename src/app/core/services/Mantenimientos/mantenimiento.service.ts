import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mantenimiento } from '../../models/mantenimiento';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private apiUrl = environment.apiUrl + '/v1/Mantenimiento';

  constructor(private http: HttpClient) { }

  // Obtiene todos los mantenimientos
  getMantenimientos(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(this.apiUrl);
  }

  // Obtiene un mantenimiento específico por su ID
  getMantenimiento(id: number): Observable<Mantenimiento> {
    return this.http.get<Mantenimiento>(`${this.apiUrl}/${id}`);
  }

  // Crea un nuevo registro de mantenimiento
  createMantenimiento(mantenimiento: Mantenimiento): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(this.apiUrl, mantenimiento);
  }

  // Actualiza un registro de mantenimiento existente
  updateMantenimiento(id: number, mantenimiento: Mantenimiento): Observable<Mantenimiento> {
    return this.http.put<Mantenimiento>(`${this.apiUrl}/${id}`, mantenimiento);
  }

  // Elimina un registro de mantenimiento
  deleteMantenimiento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Obtiene mantenimientos filtrados por habitación
  getMantenimientosPorHabitacion(habitacionId: number): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(`${this.apiUrl}/habitacion/${habitacionId}`);
  }

  // Obtiene mantenimientos filtrados por empleado
  getMantenimientosPorEmpleado(empleadoId: number): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(`${this.apiUrl}/empleado/${empleadoId}`);
  }

  // Obtiene mantenimientos filtrados por tipo
  getMantenimientosPorTipo(tipo: string): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(`${this.apiUrl}/tipo/${tipo}`);
  }
}