import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  router = inject(Router);
  authService = inject(AuthService);

  apiLogin: any = {
    email: '',
    password: ''
  };

  onlogin() {
    this.authService.login(this.apiLogin).subscribe(
      (response: any) => {
        localStorage.setItem('token', response.token);

        alert('Login Successful');
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        alert('Invalid Credentials');
      }
    );
  }
}