import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FacturasService } from '../../../core/services/Facturas/facturas.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Factura } from '../../../core/models/factura';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css'],
  standalone: true,
  imports: [CommonModule, NgClass, CurrencyPipe, RouterModule, FormsModule]
})
export class FacturaComponent implements OnInit {
  facturas: Factura[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Variables para paginación
  pagina: number = 1;
  registros: number = 5;
  totalPaginas: number = 0;
  paginaActual: Factura[] = [];

  constructor(
    private facturaService: FacturasService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarFacturas();
  }

  // Verificar si el usuario es administrador
  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2; // 2 representa el rol de administrador
  }

  // Verificar si el usuario es cliente regular
  isUser(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 3; // 3 representa el rol de usuario normal
  }

  cargarFacturas(): void {
    this.loading = true;
    
    // Tanto para administradores como para usuarios normales, cargar todas las facturas
    this.facturaService.obtenerFacturas().subscribe({
      next: (data) => {
        this.facturas = data;
        this.calcularPaginacion();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las facturas';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  // Método para calcular la paginación
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.facturas.length / this.registros);
    
    // Si no hay datos, asegurarse de que hay al menos una página
    if (this.totalPaginas === 0) {
      this.totalPaginas = 1;
    }
    
    // Asegurarse de que la página actual es válida
    if (this.pagina > this.totalPaginas) {
      this.pagina = this.totalPaginas;
    } else if (this.pagina < 1) {
      this.pagina = 1;
    }
    
    // Calcular los índices de inicio y fin
    const inicio = (this.pagina - 1) * this.registros;
    const fin = Math.min(inicio + this.registros, this.facturas.length);
    
    // Obtener los elementos de la página actual
    this.paginaActual = this.facturas.slice(inicio, fin);
  }

  // Métodos de paginación
  anterior(): void {
    if (this.pagina > 1) {
      this.pagina--;
      this.calcularPaginacion();
    }
  }

  siguiente(): void {
    if (this.pagina < this.totalPaginas) {
      this.pagina++;
      this.calcularPaginacion();
    }
  }

  // Método para cambiar el número de registros por página
  cambiarRegistros(event: any): void {
    this.registros = parseInt(event.target.value);
    this.pagina = 1; // Volver a la primera página
    this.calcularPaginacion();
  }

  // Método para eliminar una factura
  eliminarFactura(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer.')) {
      this.facturaService.eliminarFactura(id).subscribe({
        next: () => {
          this.toastr.success('Factura eliminada correctamente');
          // Actualizar la lista de facturas
          this.facturas = this.facturas.filter(f => f.id !== id);
          this.calcularPaginacion();
        },
        error: (error) => {
          this.toastr.error('Error al eliminar la factura');
          console.error('Error:', error);
        }
      });
    }
  }
}