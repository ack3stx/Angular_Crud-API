import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitacionesService } from '../../core/services/Habitaciones/habitaciones.service';
import { Habitacion } from '../../core/models/habitacion';

@Component({
  selector: 'app-user-habitaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-habitaciones.component.html',
  styleUrl: './user-habitaciones.component.css'
})
export class UserHabitacionesComponent implements OnInit {
  habitaciones: Habitacion[] = [];
  loading = false;
  error = '';

  constructor(private habitacionesService: HabitacionesService) {}

  ngOnInit(): void {
    this.loadHabitaciones();
  }

  loadHabitaciones(): void {
    this.loading = true;
    this.habitacionesService.getHabitaciones().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las habitaciones';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }
}