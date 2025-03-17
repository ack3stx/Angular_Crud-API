import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HuespedesService } from '../../core/services/huespedes/huespedes.service';
import { Huesped } from '../../core/models/huesped';

@Component({
  selector: 'app-user-huesped',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-huesped.component.html',
  styleUrl: './user-huesped.component.css'
})
export class UserHuespedComponent implements OnInit {
  huespedes: Huesped[] = [];
  loading = false;
  error = '';

  constructor(private huespedService: HuespedesService) {}

  ngOnInit(): void {
    this.loadHuespedes();
  }

  loadHuespedes(): void {
    this.loading = true;
    this.huespedService.getHuespedes().subscribe({
      next: (data) => {
        this.huespedes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los huéspedes';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }
}