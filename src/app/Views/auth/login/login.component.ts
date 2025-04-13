import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginCredentials } from '../../../core/models/login-credentials';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loading = false;
  cuentaNoVerificada = false;
  enviandoCodigo = false;
  emailActual = '';
  
  FormularioLogin = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  onlogin() {
    if (this.FormularioLogin.valid) {
      this.loading = true;
      const formValues = this.FormularioLogin.value;
  
      const credentials: LoginCredentials = {
        email: formValues.email || '',
        password: formValues.password || ''
      };
      
      this.emailActual = credentials.email;
      
      this.cuentaNoVerificada = false;
        
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.loading = false;
          localStorage.setItem('token', response.token);
          this.toastr.success('Has iniciado sesión correctamente', 'Bienvenido');
        },
        error: (error) => {
          this.loading = false;
          console.log(error);
          
          if (error.status === 401 && error.error?.message === "Usuario inactivo") {
            this.cuentaNoVerificada = true;
            
            this.toastr.warning(
              'Por favor verifica tu cuenta a través del enlace enviado a tu correo electrónico.', 
              'Cuenta sin verificar', 
              {
                timeOut: 8000,
                progressBar: true,
                closeButton: true,
                positionClass: 'toast-top-center'
              }
            );
          } 

          if(error.status === 401 && error.error?.message === "Usuario deshabilitado") {
            this.toastr.error(
              'Tu cuenta ha sido deshabilitada. Por favor contacta al soporte.', 
              'Cuenta deshabilitada'
            );
          }          
          
          else if (error.status === 401 && error.error?.message === "Unauthorized") {
            this.toastr.error(
              'Las credenciales proporcionadas no son correctas', 
              'Error de inicio de sesión'
            );
          }
          else if (error.status === 404 && error.error?.message === "Usuario no encontrado") {
            this.toastr.error(
              'Usuario o Contraseña incorrectos',
              'Error de inicio de sesión'
            );
          }

        }
      });
    } else {
      Object.keys(this.FormularioLogin.controls).forEach(key => {
        const control = this.FormularioLogin.get(key);
        control?.markAsTouched();
      });
      
      this.toastr.error('Por favor completa correctamente todos los campos', 'Formulario inválido');
    }
  }
  
  // Método para reenviar el código de verificación

reenviarCodigo() {
  if (!this.emailActual) {
    this.toastr.error('No se pudo identificar tu correo electrónico', 'Error');
    return;
  }
  
  this.enviandoCodigo = true;
  
  this.authService.reenviarCodigoVerificacion(this.emailActual).subscribe({
    next: (response) => {
      this.toastr.success(
        'Hemos enviado un nuevo correo de verificación a tu dirección de email', 
        'Correo enviado'
      );
      this.enviandoCodigo = false;
    },
    error: (error) => {
      console.error('Error al reenviar código:', error);
      
      if (error.status === 429 && error.error?.message && error.error?.tiempo_restante) {
        const minutos = error.error.tiempo_restante;
        let mensaje = error.error.message;
        
        if (mensaje.includes("Debes esperar")) {
          mensaje = `Debes esperar ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} más antes de solicitar otro código.`;
        }
        
        this.toastr.warning(
          mensaje,
          'Demasiados intentos',
          {
            timeOut: 10000,
            progressBar: true,
            closeButton: true
          }
        );
      } else {
        this.toastr.error(
          'No pudimos enviar el correo de verificación. Inténtalo más tarde.', 
          'Error'
        );
      }
      
      this.enviandoCodigo = false;
    }
  });
}

  get emailInvalid() {
    return this.FormularioLogin.get('email')?.invalid && 
           this.FormularioLogin.get('email')?.touched;
  }
  
  get passwordInvalid() {
    return this.FormularioLogin.get('password')?.invalid && 
           this.FormularioLogin.get('password')?.touched;
  }
}