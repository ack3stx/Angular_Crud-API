import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../core/services/userservice/users-service.service';
import { User } from '../../../core/models/user';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
  providers: [DatePipe]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  success = '';

  constructor(
    private usersService: UsersService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error = 'Error al cargar la lista de usuarios';
        this.loading = false;
      }
    });
  }

  disableUser(user: User) {
    if (confirm(`¿Está seguro de desactivar al usuario ${user.name}?`)) {
      this.loading = true;
      this.usersService.disableUser(user.email).subscribe({
        next: () => {
          this.success = `Usuario ${user.name} desactivado exitosamente`;
          this.loadUsers();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al desactivar usuario:', err);
          this.error = 'Error al desactivar el usuario';
          this.loading = false;
        }
      });
    }
  }

  enableUser(user: User) {
    if (confirm(`¿Está seguro de activar al usuario ${user.name}?`)) {
      this.loading = true;
      this.usersService.enableUser(user.email).subscribe({
        next: () => {
          this.success = `Usuario ${user.name} activado exitosamente`;
          this.loadUsers();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al activar usuario:', err);
          this.error = 'Error al activar el usuario';
          this.loading = false;
        }
      });
    }
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  getRoleName(rol: string): string {
    return rol === '2' ? 'Administrador' : 'Usuario';
  }
}