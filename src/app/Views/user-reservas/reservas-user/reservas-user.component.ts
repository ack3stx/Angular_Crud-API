import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservacionesService } from '../../../core/services/Reservaciones/reservaciones.service';
import { Reservacion } from '../../../core/models/reservacion'; // Import the interface

@Component({
  selector: 'app-reservas-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas-user.component.html',
  styleUrl: './reservas-user.component.css'
})
export class ReservasUserComponent implements OnInit {
  reservaciones: Reservacion[] = [];
  loading = false;
  error = '';

  constructor(private reservacionesService: ReservacionesService) {}

  ngOnInit() {
    this.loadReservaciones();
  }

  loadReservaciones() {
    this.loading = true;
    this.reservacionesService.todaslasreservaciones().subscribe({
      next: (data) => {
        this.reservaciones = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar reservaciones:', err);
        this.error = 'Error al cargar las reservaciones';
        this.loading = false;
      }
    });
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString();
  }
}