import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && this.authService.getUserRole() === 2;
  }

  isUser(): boolean {
    return this.isLoggedIn() && this.authService.getUserRole() === 3;
  }

  // Corregido: Un usuario con rol 1 está logueado pero con restricciones
  isRestrictedUser(): boolean {
    return this.isLoggedIn() && this.authService.getUserRole() === 1;
  }

  // Corregido: Un invitado NO está logueado
  isGuest(): boolean {
    return !this.isLoggedIn();
  }

  getRoleText(): string {
    const role = this.authService.getUserRole();
    switch(role) {
      case 2: return 'Administrador';
      case 3: return 'Usuario';
      case 1: return 'Acceso Restringido';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}