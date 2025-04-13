import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
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
export class FacturaComponent implements OnInit, OnDestroy {
  facturas: Factura[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  pagina: number = 1;
  registros: number = 5;
  totalPaginas: number = 0;
  paginaActual: Factura[] = [];
  actualizando: boolean = false;
  lastUpdate: string = '';

  private eventSource: EventSource | null = null;
  
  constructor(
    private facturaService: FacturasService,
    private authService: AuthService,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.cargarFacturas();
    this.connectSSE();
  }

  ngOnDestroy(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  isUser(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 3;
  }

  connectSSE(): void {
    const url = 'http://localhost:3333/stream-facturas';
    this.eventSource = new EventSource(url);
  
    this.eventSource.onmessage = (event) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
        console.log('Evento recibido:', data);
        
        this.ngZone.run(() => {
          if (data && data.evento) {
            switch (data.evento) {
              case 'create':
                this.toastr.success('Nueva factura registrada', 'Éxito');
                break;
              case 'updated':
                this.toastr.info('Factura actualizada', 'Información');
                break;
              case 'deleted':
                this.toastr.warning('Factura eliminada', 'Alerta');
                break;
              default:
                console.log(`Evento desconocido: ${data.evento}`);
            }
          }
          
          // Siempre actualizar los datos independientemente del tipo de evento
          this.cargarFacturas();
          this.lastUpdate = new Date().toLocaleTimeString();
        });
      } catch (e) {
        console.error('Error al procesar el evento:', e);
      }
    };
  
    // Mantener el handler de error
    this.eventSource.onerror = (error) => {
      console.error('Error en la conexión SSE:', error);
      this.eventSource?.close();
      
      setTimeout(() => {
        this.connectSSE();
      }, 5000);
    };
  }

  cargarFacturas(): void {
    if (this.facturas.length === 0) {
      this.loading = true;
    }
    this.actualizando = true;
    
    this.facturaService.obtenerFacturas().subscribe({
      next: (data) => {
        this.facturas = data.sort((a, b) => b.id - a.id);
        this.calcularPaginacion();
        this.loading = false;
        this.actualizando = false;
        this.lastUpdate = new Date().toLocaleTimeString();
      },
      error: (error) => {
        this.error = 'Error al cargar las facturas';
        this.loading = false;
        this.actualizando = false;
      }
    });
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.facturas.length / this.registros);
    if (this.totalPaginas === 0) this.totalPaginas = 1;
    if (this.pagina > this.totalPaginas) this.pagina = this.totalPaginas;
    const inicio = (this.pagina - 1) * this.registros;
    const fin = Math.min(inicio + this.registros, this.facturas.length);
    this.paginaActual = this.facturas.slice(inicio, fin);
  }

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

  cambiarRegistros(event: any): void {
    this.registros = parseInt(event.target.value);
    this.pagina = 1;
    this.calcularPaginacion();
  }

  eliminarFactura(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
      this.facturaService.eliminarFactura(id).subscribe({
        next: () => {
          this.cargarFacturas();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          this.toastr.error('Error al eliminar la factura');
          this.cargarFacturas();
        }
      });
    }
  }

  actualizarManualmente(): void {
    this.cargarFacturas();
  }
}