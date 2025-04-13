import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuditoriaService } from '../../core/services/Auditoria/auditoria.service';
import { Auditoria } from '../../core/models/auditoria';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css']
})
export class AuditoriaComponent implements OnInit {
  auditorias: Auditoria[] = [];
  loading = false;
  error = '';
  expandedRow: number | null = null;
  
  // Variables para paginación
  pagina: number = 1;
  registros: number = 10;
  totalPaginas: number = 1;
  paginaActual: Auditoria[] = [];

  constructor(
    private auditoriaService: AuditoriaService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.cargarAuditorias();
  }

  cargarAuditorias() {
    this.loading = true;
    this.auditoriaService.getAuditorias().subscribe({
      next: (data) => {
        this.auditorias = data;
        this.calcularPaginacion();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar auditorías:', error);
        this.toastr.error('Error al cargar auditorías');
        this.error = 'Error al cargar el registro de auditoría';
        this.loading = false;
      }
    });
  }

  calcularPaginacion() {
    this.totalPaginas = Math.ceil(this.auditorias.length / this.registros);
    if (this.totalPaginas === 0) this.totalPaginas = 1;
    this.actualizarPaginaActual();
  }

  actualizarPaginaActual() {
    const inicio = (this.pagina - 1) * this.registros;
    const fin = inicio + this.registros;
    this.paginaActual = this.auditorias.slice(inicio, fin);
  }

  siguiente() {
    if (this.pagina < this.totalPaginas) {
      this.pagina++;
      this.actualizarPaginaActual();
    }
  }

  anterior() {
    if (this.pagina > 1) {
      this.pagina--;
      this.actualizarPaginaActual();
    }
  }

  cambiarRegistros(event: any) {
    this.registros = Number(event.target.value);
    this.pagina = 1;
    this.calcularPaginacion();
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      return new Date(fecha.replace(' ', 'T')).toLocaleString();
    } catch (error) {
      return fecha;
    }
  }

  toggleDetalles(index: number) {
    this.expandedRow = this.expandedRow === index ? null : index;
  }

  // Badge para acciones
  getClaseBadge(accion: string): string {
    if (!accion) return 'badge bg-secondary';
    
    switch (accion.toLowerCase()) {
      case 'creó':
        return 'badge bg-success';
      case 'actualizó':
        return 'badge bg-primary';
      case 'eliminó':
        return 'badge bg-danger';
      case 'consultó':
        return 'badge bg-info';
      case 'inició sesión':
        return 'badge bg-success';
      case 'intentó iniciar sesión':
        return 'badge bg-warning';
      default:
        return 'badge bg-secondary';
    }
  }
}