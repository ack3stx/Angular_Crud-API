import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginCredentials } from '../../../core/models/login-credentials';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  router = inject(Router);
  authService = inject(AuthService);

  apiLogin: LoginCredentials = {
    email: '',
    password: ''
  };

  onlogin() {
    this.authService.login(this.apiLogin).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        alert('Login Successful');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        alert('Invalid Credentials');
      }
    });
  }
}