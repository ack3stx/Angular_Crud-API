import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginCredentials } from '../../../core/models/login-credentials';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  FormularioLogin = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(1)
    ])
  });


  onlogin() {
    if (this.FormularioLogin.valid) {
      const formValues = this.FormularioLogin.value;

      const credentials: LoginCredentials = {
        email: formValues.email || '',
        password: formValues.password || ''
      };
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          this.toastr.success('Login exitoso');
          this.router.navigate(['/dashboard']);
          this.FormularioLogin.reset();
        },
        error: (error) => {
          console.log(error);
          this.toastr.error('Credenciales inválidas', 'Error');
        }
      });
    }
    else {
      this.toastr.error('Datos inválidos', 'Error');
      
    }
  }
}