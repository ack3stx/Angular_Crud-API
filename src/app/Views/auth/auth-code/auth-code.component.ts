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
    // Obtener el token de la URL
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
      } else {
        this.error = 'Token no encontrado';
        this.router.navigate(['/login']);
      }
    });
  }

  // ...existing code...
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
        this.success = 'Correo verificado exitosamente';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error.message || 'Error al verificar el código';
        this.loading = false;
      }
    });
  }
}
// ...existing code...
}