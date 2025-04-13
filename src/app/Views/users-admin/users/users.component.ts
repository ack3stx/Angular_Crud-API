import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/userservice/users-service.service';
import { User } from '../../../core/models/user';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
  providers: [DatePipe]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  paginaActual: User[] = [];
  loading = false;
  error = '';
  success = '';
  
  searchTerm: string = '';
  filterRole: string = '';
  filterStatus: string = '';
  
  // Para paginación
  pagina: number = 1;
  registros: number = 10;
  totalPaginas: number = 0;
  actualizando: boolean = false;

  constructor(
    private usersService: UsersService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.calcularPaginacion();
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error = 'Error al cargar la lista de usuarios';
        this.loading = false;
        this.toastr.error('No se pudieron cargar los usuarios', 'Error');
      }
    });
  }

  refrescarDatos() {
    this.actualizando = true;
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.calcularPaginacion();
        this.actualizando = false;
        this.toastr.success('Datos actualizados correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar usuarios:', err);
        this.error = 'Error al actualizar la lista de usuarios';
        this.actualizando = false;
        this.toastr.error('No se pudieron actualizar los usuarios', 'Error');
      }
    });
  }

  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const searchMatch = !this.searchTerm || 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const roleMatch = !this.filterRole || user.rol === this.filterRole;
      
      const statusMatch = !this.filterStatus || 
        (this.filterStatus === 'active' && user.estado === 'activo') ||
        (this.filterStatus === 'inactive' && user.estado === 'ban');
      
      return searchMatch && roleMatch && statusMatch;
    });
  }
  
  calcularPaginacion() {
    const filtered = this.filteredUsers;
    this.totalPaginas = Math.ceil(filtered.length / this.registros);
    
    if (this.pagina > this.totalPaginas && this.totalPaginas > 0) {
      this.pagina = this.totalPaginas;
    }
    
    const inicio = (this.pagina - 1) * this.registros;
    const fin = Math.min(inicio + this.registros, filtered.length);
    
    this.paginaActual = filtered.slice(inicio, fin);
  }
  
  cambiarRegistros(event: any) {
    this.registros = parseInt(event.target.value);
    this.pagina = 1;
    this.calcularPaginacion();
  }
  
  anterior() {
    if (this.pagina > 1) {
      this.pagina--;
      this.calcularPaginacion();
    }
  }
  
  siguiente() {
    if (this.pagina < this.totalPaginas) {
      this.pagina++;
      this.calcularPaginacion();
    }
  }

  disableUser(user: User) {
    if (confirm(`¿Está seguro de desactivar al usuario ${user.name}?`)) {
      this.actualizando = true;
      this.usersService.disableUser(user.email).subscribe({
        next: () => {
          this.toastr.success(`Usuario ${user.name} desactivado exitosamente`);
          setTimeout(() => {
            this.refrescarDatos();
          }, 500);
        },
        error: (err) => {
          console.error('Error al desactivar usuario:', err);
          this.toastr.error('Error al desactivar el usuario');
          this.actualizando = false;
        }
      });
    }
  }

  enableUser(user: User) {
    if (confirm(`¿Está seguro de activar al usuario ${user.name}?`)) {
      this.actualizando = true;
      this.usersService.enableUser(user.email).subscribe({
        next: () => {
          this.toastr.success(`Usuario ${user.name} activado exitosamente`);
          setTimeout(() => {
            this.refrescarDatos();
          }, 500);
        },
        error: (err) => {
          console.error('Error al activar usuario:', err);
          this.toastr.error('Error al activar el usuario');
          this.actualizando = false;
        }
      });
    }
  }

  promoteToAdmin(user: User) {
    if (confirm(`¿Está seguro de cambiar a ${user.name} a rol Administrador?`)) {
      this.actualizando = true;
      this.usersService.changeToAdmin(user.id).subscribe({
        next: () => {
          this.toastr.success(`Usuario ${user.name} ahora es Administrador`);
          setTimeout(() => {
            this.refrescarDatos();
          }, 500);
        },
        error: (err) => {
          console.error('Error al cambiar rol:', err);
          this.toastr.error('Error al cambiar el rol del usuario');
          this.actualizando = false;
        }
      });
    }
  }

  demoteToUser(user: User) {
    if (confirm(`¿Está seguro de cambiar a ${user.name} a rol Usuario?`)) {
      this.actualizando = true;
      this.usersService.changeToUser(user.id).subscribe({
        next: () => {
          this.toastr.success(`${user.name} ahora es Usuario regular`);
          setTimeout(() => {
            this.refrescarDatos();
          }, 500);
        },
        error: (err) => {
          console.error('Error al cambiar rol:', err);
          this.toastr.error('Error al cambiar el rol del usuario');
          this.actualizando = false;
        }
      });
    }
  }

  navigateToEdit(user: User) {
    this.router.navigate(['/admin/users/edit', user.id]);
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  getRoleName(rol: string): string {
    if (rol === '2') return 'Administrador';
    if (rol === '3') return 'Usuario';
    return 'Invitado'; // rol 1
  }

  isAdmin(user: User): boolean {
    return user.rol === '2';
  }

  isRegularUser(user: User): boolean {
    return user.rol === '3';
  }
  isGuestUser(user: User): boolean {
    return user.rol === '1';
  }

  getStatusBadgeClass(estado: string): string {
    return estado === 'activo' ? 'badge bg-success' : 'badge bg-danger';
  }

  getStatusText(estado: string): string {
    return estado === 'activo' ? 'Activo' : 'Inactivo';
  }

  changeToGuest(user: User) {
    if (confirm(`¿Está seguro de cambiar a ${user.name} a rol Invitado?`)) {
      this.actualizando = true;
      this.usersService.darrolguest(user.id).subscribe({
        next: () => {
          this.toastr.success(`Usuario ${user.name} ahora es Invitado`);
          setTimeout(() => {
            this.refrescarDatos();
          }, 500);
        },
        error: (err) => {
          console.error('Error al cambiar rol a Invitado:', err);
          this.toastr.error('Error al cambiar el rol del usuario a Invitado');
          this.actualizando = false;
        }
      });
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterRole = '';
    this.filterStatus = '';
    this.pagina = 1;
    this.calcularPaginacion();
  }
  
  getRowClass(user: User): string {
    return user.estado === 'ban' ? 'banned-user-row' : '';
  }
}