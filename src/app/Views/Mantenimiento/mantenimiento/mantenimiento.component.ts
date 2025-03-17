import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MantenimientoService } from '../../../core/services/Mantenimientos/mantenimiento.service';
import { Mantenimiento } from '../../../core/models/mantenimiento';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mantenimiento.component.html',
  styleUrl: './mantenimiento.component.css'
})
export class MantenimientoComponent implements OnInit {
  mantenimientos: Mantenimiento[] = [];
  loading = false;
  error = '';

  constructor(private mantenimientoService: MantenimientoService) {}

  ngOnInit() {
    this.loadMantenimientos();
  }

  loadMantenimientos() {
    this.loading = true;
    this.mantenimientoService.getMantenimientos().subscribe({
      next: (data) => {
        this.mantenimientos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar mantenimientos:', err);
        this.error = 'Error al cargar la lista de mantenimientos';
        this.loading = false;
      }
    });
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString();
  }
}