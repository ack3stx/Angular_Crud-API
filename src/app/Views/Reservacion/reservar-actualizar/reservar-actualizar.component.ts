import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
    // Verificar si el usuario es administrador, sino redirigir
    if (!this.isAdmin()) {
      this.toastr.warning('No tienes permiso para acceder a esta página');
      this.router.navigate(['/reservaciones']);
      return;
    }

    this.initForm();
    
    // Obtener ID de la URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.reservacionId = +params['id'];
        this.cargarDatos();
      } else {
        this.toastr.error('No se especificó la reservación a editar');
        this.router.navigate(['/reservaciones']);
      }
    });
  }

  // Verificar si el usuario es administrador
  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  private initForm() {
    this.reservacionForm = this.fb.group({
      fecha_entrada: ['', [Validators.required]],
      fecha_salida: ['', [Validators.required]],
      habitacion_id: ['', [Validators.required]],
      huesped_id: ['', [Validators.required]],
      precio_total: [0, [Validators.required, Validators.min(0)]],
      estado_reservacion: ['', [Validators.required]],
      metodo_pago: ['', [Validators.required]],
      monto_pagado: [0, [Validators.required, Validators.min(0)]],
      estado: [''] // Este campo se llenará con el valor actual
    });

    // Observadores para calcular automáticamente el precio total
    this.reservacionForm.get('fecha_entrada')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    this.reservacionForm.get('fecha_salida')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    this.reservacionForm.get('habitacion_id')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
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
      // Una vez cargados los catálogos, cargar la reservación
      this.cargarReservacion();
    })
    .catch(() => {
      this.loadingData = false;
      this.toastr.error('Error al cargar los datos necesarios');
    });
  }

  cargarReservacion() {
    this.reservacionService.obtenerReservacion(this.reservacionId).subscribe({
      next: (reservacion) => {
        // Formatear las fechas para input type="date": YYYY-MM-DD
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
        this.toastr.error(this.error);
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
      // Calcular número de días
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);
      const diferenciaTiempo = salida.getTime() - entrada.getTime();
      const dias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

      if (dias > 0) {
        // Buscar precio de la habitación
        const habitacion = this.habitaciones.find(h => h.id == habitacionId);
        if (habitacion && habitacion.precio_habitacion) {
          // Convertir el precio de string a number para evitar error de tipos
          const precioHabitacion = parseFloat(habitacion.precio_habitacion);
          if (!isNaN(precioHabitacion)) {
            this.precioCalculado = precioHabitacion * dias;
            this.reservacionForm.patchValue({ precio_total: this.precioCalculado });
          }
        }
      }
    }
  }

  onSubmit() {
    if (this.reservacionForm.invalid) {
      this.toastr.warning('Por favor complete todos los campos requeridos');
      
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.reservacionForm.controls).forEach(key => {
        this.reservacionForm.get(key)?.markAsTouched();
      });
      
      return;
    }

    this.loading = true;
    
    // Obtener los valores del formulario
    const formValues = this.reservacionForm.value;
    
    // Crear objeto con los nombres de campo que espera la API
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
      next: () => {
        this.toastr.success('Reservación actualizada correctamente');
        this.loading = false;
        this.router.navigate(['/reservaciones']);
      },
      error: (error) => {
        this.error = 'Error al actualizar la reservación';
        this.loading = false;
        console.error('Error:', error);
        this.toastr.error(error.error?.message || this.error);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/reservaciones']);
  }
}