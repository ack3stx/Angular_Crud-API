import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FacturasService } from '../../../core/services/Facturas/facturas.service';
import { ReservacionesService } from '../../../core/services/Reservaciones/reservaciones.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Reservacion } from '../../../core/models/reservacion';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-crear-factura',
  templateUrl: './crear-factura.component.html',
  styleUrls: ['./crear-factura.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CrearFacturaComponent implements OnInit {
  facturaForm!: FormGroup;
  reservaciones: Reservacion[] = [];
  loading: boolean = false;
  loadingData: boolean = true;
  error: string | null = null;
  submitted: boolean = false;
  reservacionSeleccionada: Reservacion | null = null;
  
  // Métodos de pago disponibles
  metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'deposito', label: 'Depósito' }
  ];

  constructor(
    private fb: FormBuilder,
    private facturaService: FacturasService,
    private reservacionService: ReservacionesService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (!this.isAdmin()) {
      this.toastr.warning('No tienes permiso para acceder a esta página');
      this.router.navigate(['/facturas']);
      return;
    }

    this.initForm();
    this.cargarReservaciones();

    // Suscribirse a cambios en la reservación seleccionada
    this.facturaForm.get('reservacion_id')?.valueChanges.subscribe(id => {
      if (id) {
        this.actualizarReservacionSeleccionada(id);
      } else {
        this.reservacionSeleccionada = null;
      }
    });
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  private initForm(): void {
    this.facturaForm = this.fb.group({
      reservacion_id: ['', [Validators.required]],
      metodo_pago: ['', [Validators.required]],
      monto_pagado: ['', [Validators.required, Validators.min(0)]],
      estado: ['Pendiente', [Validators.required]]
    });
  }

  actualizarReservacionSeleccionada(reservacionId: number): void {
    const reservacion = this.reservaciones.find(r => r.id === Number(reservacionId));
    this.reservacionSeleccionada = reservacion || null;
    
    if (reservacion) {
      const precioTotal = Number(reservacion.precio_total);
      const montoPagado = Number(reservacion.monto_pagado || 0);
      const montoPendiente = precioTotal - montoPagado;
      
      // Actualizar validadores para monto_pagado
      const montoControl = this.facturaForm.get('monto_pagado');
      if (montoControl) {
        montoControl.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(montoPendiente)
        ]);
        montoControl.updateValueAndValidity();
        
        // Sugerir monto pendiente como valor por defecto
        montoControl.setValue(montoPendiente > 0 ? montoPendiente : 0);
      }
    }
  }

  cargarReservaciones(): void {
    this.loadingData = true;
    
    this.reservacionService.todaslasreservaciones().subscribe({
      next: (reservaciones) => {
        // Filtrar reservaciones activas y no canceladas
        this.reservaciones = reservaciones.filter(r => 
          r.estado_reservacion !== 'Cancelada' && r.estado !== 'Inactivo'
        );
        this.loadingData = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las reservaciones';
        this.loadingData = false;
        console.error('Error:', error);
        this.toastr.error(this.error);
      }
    });
  }

  // Método para verificar si un campo es inválido
  campoInvalido(campo: string): boolean {
    const control = this.facturaForm.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }

  // Método para obtener mensaje de error para cada campo
  getMensajeError(campo: string): string {
    const control = this.facturaForm.get(campo);
    if (!control) return '';
    if (!control.errors) return '';

    const errors = control.errors;
    
    if (errors['required']) return 'Este campo es obligatorio';
    
    if (campo === 'monto_pagado') {
      if (errors['min']) return 'El monto no puede ser negativo';
      if (errors['max']) {
        return `El monto no puede ser mayor al saldo pendiente ($${errors['max'].max})`;
      }
    }
    
    return 'Campo inválido';
  }

  // Calcular el monto pendiente de la reservación seleccionada
  getMontoPendiente(): number {
    if (!this.reservacionSeleccionada) return 0;
    
    const precioTotal = Number(this.reservacionSeleccionada.precio_total);
    const montoPagado = Number(this.reservacionSeleccionada.monto_pagado || 0);
    return precioTotal - montoPagado;
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.facturaForm.invalid) {
      Object.keys(this.facturaForm.controls).forEach(key => {
        this.facturaForm.get(key)?.markAsTouched();
      });
      
      this.toastr.warning('Por favor completa todos los campos requeridos correctamente');
      return;
    }

    this.loading = true;
    
    const facturaData = this.facturaForm.value;
    
    this.facturaService.crearFactura(facturaData).subscribe({
      next: () => {
        this.toastr.success('Factura creada correctamente');
        this.loading = false;
        this.router.navigate(['/facturas']);
      },
      error: (error) => {
        this.error = 'Error al crear la factura';
        this.loading = false;
        console.error('Error:', error);
        this.toastr.error(error.error?.message || this.error);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/facturas']);
  }
}