import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Factura } from '../../models/factura';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacturasService {

  private url = environment.apiUrl + '/v1/Factura';  

  constructor(private http: HttpClient) { }

  // Obtener todas las facturas
  obtenerFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.url);
  }

  // Obtener facturas de un usuario específico
  obtenerFacturasUsuario(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.url}/usuario`);
  }

  // Obtener una factura por su ID
  obtenerFactura(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.url}/${id}`);
  }

  // Crear una nueva factura
  crearFactura(factura: Factura): Observable<Factura> {
    return this.http.post<Factura>(this.url, factura);
  }

  // Actualizar una factura existente
  actualizarFactura(id: number, factura: Factura): Observable<Factura> {
    return this.http.put<Factura>(`${this.url}/${id}`, factura);
  }

  // Eliminar una factura (cambiar estado)
  eliminarFactura(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}