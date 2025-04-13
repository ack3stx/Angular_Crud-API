import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReservacionesService } from '../../../core/services/Reservaciones/reservaciones.service';
import { HuespedesService } from '../../../core/services/huespedes/huespedes.service';
import { HabitacionesService } from '../../../core/services/Habitaciones/habitaciones.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Huesped } from '../../../core/models/huesped';
import { Habitacion } from '../../../core/models/habitacion';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reservar-actualizar',
  templateUrl: './reservar-actualizar.component.html',
  styleUrls: ['./reservar-actualizar.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ReservaractualizarComponent implements OnInit {
  reservacionForm!: FormGroup;
  huespedes: Huesped[] = [];
  habitaciones: Habitacion[] = [];
  loading: boolean = false;
  loadingData: boolean = true;
  error: string | null = null;
  reservacionId!: number;
  precioCalculado: number = 0;
  submitted: boolean = false;

  // Métodos de pago disponibles
  metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'deposito', label: 'Depósito' }
  ];
  
  // Estados de reservación disponibles
  estadosReservacion = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Confirmada', label: 'Confirmada' },
    { value: 'Cancelada', label: 'Cancelada' }
  ];

  // Fecha mínima para entrada
  fechaMinima = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private reservacionService: ReservacionesService,
    private huespedService: HuespedesService,
    private habitacionService: HabitacionesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (!this.isAdmin()) {
      this.toastr.warning('No tienes permiso para acceder a esta página');
      this.router.navigate(['/reservaciones']);
      return;
    }

    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.reservacionId = +params['id'];
        this.cargarDatos();
      } else {
        this.error = 'No se especificó la reservación a editar';
        this.router.navigate(['/reservaciones']);
      }
    });
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  // Validador personalizado: fecha de salida debe ser posterior a fecha de entrada
  fechaValidaValidator(group: FormGroup): ValidationErrors | null {
    const fechaEntrada = group.get('fecha_entrada')?.value;
    const fechaSalida = group.get('fecha_salida')?.value;
    
    if (!fechaEntrada || !fechaSalida) {
      return null; // Si alguno no tiene valor, otros validadores se encargarán
    }
    
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    
    // Verificar que la fecha de salida sea posterior a la de entrada
    if (salida <= entrada) {
      return { 'fechaInvalida': true };
    }
    
    return null;
  }

  private initForm() {
    this.reservacionForm = this.fb.group({
      fecha_entrada: ['', [
        Validators.required
      ]],
      fecha_salida: ['', [
        Validators.required
      ]],
      habitacion_id: ['', [
        Validators.required
      ]],
      huesped_id: ['', [
        Validators.required
      ]],
      precio_total: [0, [
        Validators.required, 
        Validators.min(0)
      ]],
      estado_reservacion: ['', [
        Validators.required
      ]],
      metodo_pago: ['', [
        Validators.required
      ]],
      monto_pagado: [0, [
        Validators.required, 
        Validators.min(0)
      ]],
      estado: ['Activo'] // Por defecto
    }, { validators: this.fechaValidaValidator });

    // Suscribirse a cambios para recalcular precio
    this.reservacionForm.get('fecha_entrada')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    this.reservacionForm.get('fecha_salida')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    this.reservacionForm.get('habitacion_id')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    
    // Suscribirse a cambios de precio total para validar monto pagado
    this.reservacionForm.get('precio_total')?.valueChanges.subscribe(valor => {
      const control = this.reservacionForm.get('monto_pagado');
      if (control) {
        // Actualizar validadores de monto pagado con el nuevo precio total
        control.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(valor || 0)
        ]);
        control.updateValueAndValidity();
      }
    });
  }

  cargarDatos() {
    this.loadingData = true;
    
    // Cargar huéspedes y habitaciones en paralelo
    Promise.all([
      new Promise<void>((resolve, reject) => {
        this.huespedService.getHuespedes().subscribe({
          next: (huespedes) => {
            this.huespedes = huespedes;
            resolve();
          },
          error: (error) => {
            this.error = 'Error al cargar los huéspedes';
            console.error('Error:', error);
            reject(error);
          }
        });
      }),
      new Promise<void>((resolve, reject) => {
        this.habitacionService.getHabitaciones().subscribe({
          next: (habitaciones) => {
            this.habitaciones = habitaciones;
            resolve();
          },
          error: (error) => {
            this.error = 'Error al cargar las habitaciones';
            console.error('Error:', error);
            reject(error);
          }
        });
      })
    ])
    .then(() => {
      this.cargarReservacion();
    })
    .catch(() => {
      this.loadingData = false;
      this.error = 'Error al cargar los datos necesarios';
    });
  }

  cargarReservacion() {
    this.reservacionService.obtenerReservacion(this.reservacionId).subscribe({
      next: (reservacion) => {
        const fechaEntrada = new Date(reservacion.fecha_entrada);
        const fechaSalida = new Date(reservacion.fecha_salida);
        
        const fechaEntradaFormateada = fechaEntrada.toISOString().split('T')[0];
        const fechaSalidaFormateada = fechaSalida.toISOString().split('T')[0];
        
        // Rellenar el formulario con los datos de la reservación
        this.reservacionForm.patchValue({
          fecha_entrada: fechaEntradaFormateada,
          fecha_salida: fechaSalidaFormateada,
          habitacion_id: reservacion.habitacion_id,
          huesped_id: reservacion.huesped_id,
          precio_total: reservacion.precio_total,
          estado_reservacion: reservacion.estado_reservacion,
          metodo_pago: reservacion.metodo_pago,
          monto_pagado: reservacion.monto_pagado,
          estado: reservacion.estado
        });
        
        this.precioCalculado = Number(reservacion.precio_total);
        this.loadingData = false;
      },
      error: (error) => {
        this.error = 'Error al cargar la reservación';
        this.loadingData = false;
        console.error('Error:', error);
        setTimeout(() => {
          this.router.navigate(['/reservaciones']);
        }, 2000);
      }
    });
  }

  calcularPrecioTotal() {
    const fechaEntrada = this.reservacionForm.get('fecha_entrada')?.value;
    const fechaSalida = this.reservacionForm.get('fecha_salida')?.value;
    const habitacionId = this.reservacionForm.get('habitacion_id')?.value;

    if (fechaEntrada && fechaSalida && habitacionId) {
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);
      
      // Verificar si las fechas son válidas antes de calcular
      if (entrada >= salida) {
        this.precioCalculado = 0;
        this.reservacionForm.patchValue({ precio_total: 0 });
        return;
      }
      
      const diferenciaTiempo = salida.getTime() - entrada.getTime();
      const dias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

      if (dias > 0) {
        const habitacion = this.habitaciones.find(h => h.id == habitacionId);
        if (habitacion && habitacion.precio_habitacion) {
          const precioHabitacion = parseFloat(habitacion.precio_habitacion);
          if (!isNaN(precioHabitacion)) {
            this.precioCalculado = precioHabitacion * dias;
            this.reservacionForm.patchValue({ precio_total: this.precioCalculado });
          }
        }
      }
    }
  }

  // Método para verificar si un campo es inválido
  campoInvalido(campo: string): boolean {
    const control = this.reservacionForm.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }

  // Método para obtener mensaje de error para cada campo
  getMensajeError(campo: string): string {
    const control = this.reservacionForm.get(campo);
    if (!control) return '';
    if (!control.errors) return '';

    const errors = control.errors;
    
    if (errors['required']) return 'Este campo es obligatorio';
    
    if (campo === 'fecha_entrada' || campo === 'fecha_salida') {
      if (errors['min']) return 'La fecha no puede ser anterior a hoy';
    }
    
    if (campo === 'precio_total' || campo === 'monto_pagado') {
      if (errors['min']) return 'El valor no puede ser negativo';
      if (errors['max']) return 'El monto pagado no puede ser mayor al precio total';
    }
    
    if (this.reservacionForm.errors && this.reservacionForm.errors['fechaInvalida'] && 
        (campo === 'fecha_entrada' || campo === 'fecha_salida')) {
      return 'La fecha de salida debe ser posterior a la fecha de entrada';
    }
    
    return 'Campo inválido';
  }

  // Verificar errores a nivel de formulario
  tieneErrorFormulario(error: string): boolean {
    return this.reservacionForm.errors !== null && this.reservacionForm.errors[error] !== undefined;
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.reservacionForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.reservacionForm.controls).forEach(key => {
        this.reservacionForm.get(key)?.markAsTouched();
      });
      
      this.error = 'Por favor complete correctamente todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = null;
    
    const formValues = this.reservacionForm.value;
    
    const reservacionActualizada = {
      id: this.reservacionId,
      fecha_entrada: formValues.fecha_entrada,
      fecha_salida: formValues.fecha_salida,
      habitacion_id: formValues.habitacion_id,
      huesped_id: formValues.huesped_id,
      precio_total: formValues.precio_total,
      estado_reservacion: formValues.estado_reservacion,
      metodo_pago: formValues.metodo_pago,
      monto_pagado: formValues.monto_pagado,
      estado: formValues.estado
    };
    
    this.reservacionService.actualizarReservacion(this.reservacionId, reservacionActualizada).subscribe({
      next: (response) => {
        this.toastr.success('Reservación actualizada correctamente');
        this.loading = false;
        this.router.navigate(['/reservaciones']);
      },
      error: (error: any) => {
        this.error = error.error?.message || 'Error al actualizar la reservación';
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/reservaciones']);
  }
}