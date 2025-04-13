import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Pusher from 'pusher-js';
import { environment, enviroment2 } from '../../../../environments/environment'; // Corregido aquí
import { FacturasService } from '../Facturas/facturas.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private pusher: Pusher;
  private channel: any;
  private huespedSubject = new Subject<any>();
  private connectionStatusSubject = new Subject<boolean>();

  constructor(private facturasService: FacturasService) {
    this.pusher = new Pusher('local', {
      cluster: 'mt1',
      wsHost: window.location.hostname,
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      channelAuthorization: {
        endpoint: "http://" + enviroment2.WebSocketUrl + ':8000/broadcasting/auth',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        },
        transport: 'ajax'
      }
    });

    Pusher.logToConsole = true;
    
    this.pusher.connection.bind('connected', () => {
      console.log('✅ WebSocket conectado');
      this.connectionStatusSubject.next(true);
    });

    this.pusher.connection.bind('disconnected', () => {
      console.log('❌ WebSocket desconectado');
      this.connectionStatusSubject.next(false);
    });

    this.pusher.connection.bind('error', (error: any) => {
      console.error('❌ Error WebSocket:', error);
      this.connectionStatusSubject.next(false);
    });

    this.channel = this.pusher.subscribe('private-Huesped');

    this.channel.bind('evento.huesped', (data: any) => {
      console.log('📨 Evento recibido desde WebSocket:', data);
      this.huespedSubject.next(data);
      
      this.facturasService.obtenerFacturas().subscribe({
        next: (response) => console.log('Facturas actualizadas tras evento de huésped'),
        error: (error) => console.error('Error al actualizar facturas:', error)
      });
    });

    this.channel.bind('.HuespedUpdated', (data: any) => {
      console.log('📨 Evento recibido (.HuespedUpdated):', data);
      this.huespedSubject.next(data);
      
      this.facturasService.obtenerFacturas().subscribe({
        next: (response) => console.log('Facturas actualizadas tras evento de huésped'),
        error: (error) => console.error('Error al actualizar facturas:', error)
      });
    });
  }

  getHuespedEvents() {
    return this.huespedSubject.asObservable();
  }

  getConnectionStatus() {
    return this.connectionStatusSubject.asObservable();
  }

  isConnected(): boolean {
    return this.pusher.connection.state === 'connected';
  }

  disconnect() {
    if (this.channel) {
      this.channel.unbind_all();
      this.pusher.unsubscribe('private-Huesped');
    }
  }
}