import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HuespedesService } from '../../../core/services/huespedes/huespedes.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { WebSocketService } from '../../../core/services/WebSocket/web-socket.service';
import { Huesped } from '../../../core/models/huesped';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-huesped',
  templateUrl: './huesped.component.html',
  styleUrls: ['./huesped.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class HuespedComponent implements OnInit, OnDestroy {
  huespedes: Huesped[] = [];
  paginaActual: Huesped[] = [];
  searchTerm = '';
  loading = false;
  error = '';
  
  // Variables para la paginación
  pagina: number = 1;
  registros: number = 5;
  totalPaginas: number = 0;
  
  // Para estado de WebSocket
  isConnected = false;
  lastUpdate: string | null = null;
  
  // Suscripciones
  private eventSubscription: Subscription | null = null;
  private connectionSubscription: Subscription | null = null;
  
  constructor(
    private huespedesService: HuespedesService,
    public authService: AuthService,
    private webSocketService: WebSocketService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Cargar datos iniciales
    this.cargarHuespedes();
    
    // Conectar WebSocket
    this.conectarWebSocket();
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
  }

  cargarHuespedes(): void {
    this.loading = true;
    this.error = '';
    
    this.huespedesService.getHuespedes().subscribe({
      next: (data) => {
        this.huespedes = data;
        
        // Ordenar huéspedes de manera consistente
        this.ordenarHuespedes();
        
        this.calcularTotalPaginas();
        this.actualizarPaginaActual();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando huéspedes:', error);
        this.error = 'Error al cargar los huéspedes';
        this.loading = false;
        this.toastr.error('Error al cargar los huéspedes', 'Error');
      }
    });
  }

  /**
   * Ordena los huéspedes de forma consistente
   * Esto asegura que los nuevos registros aparezcan en la posición correcta
   */
  private ordenarHuespedes(): void {
    // Ordenar por ID de forma ascendente (menor a mayor)
    this.huespedes.sort((a, b) => a.id! - b.id!);
  }

  conectarWebSocket(): void {
    console.log('🔌 Conectando a WebSocket para escuchar eventos...');
    
    // Monitorear estado de conexión
    this.connectionSubscription = this.webSocketService.getConnectionStatus().subscribe(isConnected => {
      this.isConnected = isConnected;
      
      if (isConnected) {
        this.toastr.success('Conectado a actualizaciones en tiempo real', 'WebSocket');
        this.lastUpdate = new Date().toLocaleTimeString();
      } else {
        this.toastr.warning('Conexión en tiempo real perdida', 'WebSocket');
      }
    });
    
    // Escuchar eventos de huéspedes
    this.eventSubscription = this.webSocketService.getHuespedEvents().subscribe({
      next: (event) => {
        console.log('📩 Evento recibido en componente:', event);
        this.lastUpdate = new Date().toLocaleTimeString();
        
        // Crear objeto huésped compatible
        const huesped: Huesped = {
          id: event.id,
          nombre: event.nombre,
          apellido: event.apellido || '',
          telefono: event.telefono || '',
          direccion: event.direccion || '',
          correo: event.correo || ''
        };
        
        // Procesar según el tipo de acción
        switch (event.action) {
          case 'created':
            this.procesarCreacion(huesped);
            break;
          
          case 'updated':
            this.procesarActualizacion(huesped);
            break;
          
          case 'deleted':
            this.procesarEliminacion(huesped);
            break;
          
          default:
            console.warn('Acción no reconocida:', event.action);
        }
      },
      error: (error) => {
        console.error('Error en la suscripción WebSocket:', error);
        this.toastr.error('Error en comunicación WebSocket', 'Error');
      }
    });
    
    // Verificar estado inicial
    this.isConnected = this.webSocketService.isConnected();
  }

  procesarCreacion(huesped: Huesped): void {
    // Verificar si ya existe este huésped (evitar duplicados)
    const existingIndex = this.huespedes.findIndex(h => h.id === huesped.id);
    
    if (existingIndex === -1) {
      // No existe, añadirlo a la lista
      this.huespedes.push(huesped);  // Cambiado de unshift a push para añadir al final
      this.toastr.success(`Huésped ${huesped.nombre} agregado`, 'Nuevo registro');
      
      // Ordenar para asegurar posición correcta
      this.ordenarHuespedes();
    } else {
      // Ya existe, actualizar datos
      this.huespedes[existingIndex] = huesped;
      this.toastr.info(`Datos de ${huesped.nombre} actualizados`, 'Actualización');
    }
    
    // Actualizar vista paginada
    this.calcularTotalPaginas();
    this.actualizarPaginaActual();
  }

  procesarActualizacion(huesped: Huesped): void {
    // Buscar y actualizar el huésped en la lista
    const index = this.huespedes.findIndex(h => h.id === huesped.id);
    
    if (index !== -1) {
      this.huespedes[index] = huesped;
      this.toastr.info(`Huésped ${huesped.nombre} actualizado`, 'Actualización');
    } else {
      // Si no existe, agregarlo (caso inusual, pero posible)
      this.huespedes.push(huesped);  // Cambiado de unshift a push para añadir al final
      
      // Ordenar para asegurar posición correcta
      this.ordenarHuespedes();
      
      this.toastr.info(`Nuevo huésped añadido: ${huesped.nombre}`, 'Actualización');
      this.calcularTotalPaginas();
    }
    
    this.actualizarPaginaActual();
  }

  procesarEliminacion(huesped: Huesped): void {
    // Guardar nombre antes de eliminar
    const nombreHuesped = this.huespedes.find(h => h.id === huesped.id)?.nombre || 'Huésped';
    
    // Eliminar de la lista
    this.huespedes = this.huespedes.filter(h => h.id !== huesped.id);
    this.toastr.warning(`${nombreHuesped} eliminado`, 'Eliminación');
    
    this.calcularTotalPaginas();
    
    // Si la página actual es mayor que el total de páginas después de la eliminación,
    // ir a la última página disponible
    if (this.pagina > this.totalPaginas && this.totalPaginas > 0) {
      this.pagina = this.totalPaginas;
    }
    
    this.actualizarPaginaActual();
  }

  // MÉTODOS DE PAGINACIÓN
  calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.huespedes.length / this.registros);
    if (this.totalPaginas === 0) this.totalPaginas = 1; // Mínimo una página aunque esté vacía
  }
  
  actualizarPaginaActual(): void {
    const inicio = (this.pagina - 1) * this.registros;
    const fin = inicio + this.registros;
    this.paginaActual = this.huespedes.slice(inicio, fin);
  }
  
  anterior(): void {
    if (this.pagina > 1) {
      this.pagina--;
      this.actualizarPaginaActual();
    }
  }
  
  siguiente(): void {
    if (this.pagina < this.totalPaginas) {
      this.pagina++;
      this.actualizarPaginaActual();
    }
  }
  
  cambiarRegistros(event: any): void {
    this.registros = +event.target.value;
    this.pagina = 1; // Volver a la primera página al cambiar los registros por página
    this.calcularTotalPaginas();
    this.actualizarPaginaActual();
  }

  // Filtrando huéspedes
  filtrarHuespedes(termino: string): void {
    this.searchTerm = termino;
    // Si implementas la lógica de filtrado, asegúrate de:
    // 1. Filtrar primero los huéspedes basado en searchTerm
    // 2. Luego ordenarlos con ordenarHuespedes()
    // 3. Finalmente recalcular paginación
    this.pagina = 1;
    this.actualizarPaginaActual();
  }

  // Borrar un huésped mediante la API
  eliminarHuesped(id: number): void {
    if (confirm('¿Estás seguro que deseas eliminar este huésped?')) {
      this.huespedesService.deleteHuesped(id).subscribe({
        next: (response) => {
          this.toastr.success('Huésped eliminado correctamente');
          this.huespedes = this.huespedes.filter(h => h.id !== id);
          this.calcularTotalPaginas();
          
          // Ajustar página actual si es necesario
          if (this.pagina > this.totalPaginas && this.totalPaginas > 0) {
            this.pagina = this.totalPaginas;
          }
          
          this.actualizarPaginaActual();
        },
        error: (error) => {
          console.error('Error al eliminar huésped:', error);
          this.toastr.error('Error al eliminar huésped');
        }
      });
    }
  }

  // Verificar permisos
  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }
  
  isUser(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 3;
  }
  
  // Forzar recarga manual
  refrescarDatos(): void {
    this.cargarHuespedes();
    this.toastr.info('Datos actualizados', 'Actualización');
  }
}