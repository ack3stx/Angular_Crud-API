import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';  // Añadido el import de map
import { Reservacion } from '../../models/reservacion';
import { ReservacionUpdate } from '../../models/reservacion-update';
import { ReservacionResponse } from '../../models/reservacion-response';
import { ReservacionListResponse } from '../../models/reservacion-list-response';  // Nuevo import

@Injectable({
  providedIn: 'root'
})
export class ReservacionesService {
  private url = 'http://127.0.0.1:8000/api/v1/Reservacion';

  constructor(private http: HttpClient) { }

  nuevaReservacion(reservacion: Reservacion): Observable<Reservacion> {
    return this.http.post<Reservacion>(this.url, reservacion);
  }

  obtenerReservacionesUsuario(): Observable<Reservacion[]> {
    return this.http.get<Reservacion[]>(`${this.url}/usuario`);
  }
  
  actualizarReservacion(id: number, datos: ReservacionUpdate): Observable<Reservacion> {
    return this.http.put<Reservacion>(`${this.url}/${id}`, datos);
  }
  
  obtenerReservacion(id: number): Observable<Reservacion> {
    return this.http.get<ReservacionResponse>(`${this.url}/${id}`).pipe(
      map((response: ReservacionResponse) => {  // Tipo explícito añadido
        if (response.success) {
          // Crear una copia de la reservación para no modificar la original
          const reservacion = { ...response.data.reservacion };
          
          // Agregar datos adicionales del huésped y habitación
          reservacion.huespedData = response.data.huesped;
          reservacion.habitacionData = response.data.habitacion;
          
          return reservacion;
        } else {
          throw new Error('No se pudo obtener la reservación');
        }
      })
    );
  }
  
  cancelarReservacion(id: number): Observable<Reservacion> {
    return this.http.put<Reservacion>(`${this.url}/cancelar/${id}`, {});
  }
  
  // Método actualizado para manejar el nuevo formato de respuesta
  todaslasreservaciones(): Observable<Reservacion[]> {
    return this.http.get<ReservacionListResponse>(this.url).pipe(
      map((response: ReservacionListResponse) => {
        if (response.success) {
          // Extraer solo los objetos "reservacion" del array de datos
          return response.data.map(item => {
            const reservacion = {...item.reservacion};
            // Opcionalmente, podemos agregar los datos relacionados a cada reservación
            reservacion.huespedData = item.huesped;
            reservacion.habitacionData = item.habitacion || undefined;
            return reservacion;
          });
        } else {
          return [];
        }
      })
    );
  }
}