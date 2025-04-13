import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-auth-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-code.component.html',
  styleUrl: './auth-code.component.css'
})
export class AuthCodeComponent implements OnInit {
  verificationForm: FormGroup;
  loading = false;
  resendingCode = false; // Nueva propiedad para controlar el estado del botón de reenvío
  error = '';
  success = '';
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
        console.log('Token from route params:', this.token);
      } else {
        // Si no está en params, buscar en queryParams
        this.route.queryParams.subscribe(queryParams => {
          if (queryParams['token']) {
            this.token = queryParams['token'];
            console.log('Token from query params:', this.token);
          } else {
            this.error = 'Token no encontrado en la URL';
          }
        });
      }
    });
  }

  resendVerificationCode() {
    if (!this.token) {
      this.error = 'No hay un token disponible para solicitar un nuevo código';
      return;
    }

    this.resendingCode = true;
    this.error = '';
    this.success = '';

    console.log('Reenviando código con token:', this.token);
    
    this.authService.ResendVerificationCode(this.token).subscribe({
      next: (response) => {
        this.resendingCode = false;
        this.success = 'Se ha enviado un nuevo código a su correo electrónico';
        console.log('Respuesta al reenviar código:', response);
      },
      error: (err) => {
        this.resendingCode = false;
        this.error = err.error?.message || 'Error al solicitar un nuevo código';
        console.error('Error al reenviar código:', err);
      }
    });
  }

  onSubmit() {
    if (this.verificationForm.valid && this.token) {
      this.loading = true;
      this.error = '';
      
      const verificationData = {
        code: this.verificationForm.get('code')?.value,
        token: this.token
      };
      
      this.authService.verifyEmail(verificationData).subscribe({
        next: () => {
          this.loading = false;
          this.success = 'Correo verificado exitosamente';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          
          if (err.status === 429) {
            this.error = 'Demasiados intentos fallidos. Por favor, espera 30 minutos antes de intentar nuevamente.';
          } else {
            this.error = err.error?.message || 'Error al verificar el código';
          }
        }
      });
    }
  }
}