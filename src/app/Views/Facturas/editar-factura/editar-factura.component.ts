import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FacturasService } from '../../../core/services/Facturas/facturas.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Factura } from '../../../core/models/factura';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-editar-factura',
  templateUrl: './editar-factura.component.html',
  styleUrls: ['./editar-factura.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class EditarFacturaComponent implements OnInit {
  facturaForm!: FormGroup;
  factura: Factura | null = null;
  facturaId!: number;
  loading: boolean = true;
  submitting: boolean = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private facturaService: FacturasService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (!this.isAdmin()) {
      this.toastr.warning('No tienes permiso para acceder a esta página');
      this.router.navigate(['/facturas']);
      return;
    }
    
    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.facturaId = +params['id'];
        this.cargarFactura();
      } else {
        this.error = 'ID de factura no especificado';
        this.loading = false;
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
      estado: ['', [Validators.required]]
    });
  }
  
  cargarFactura(): void {
    this.loading = true;
    
    this.facturaService.obtenerFactura(this.facturaId).subscribe({
      next: (factura) => {
        this.factura = factura;
        this.facturaForm.patchValue({
          reservacion_id: factura.reservacion_id,
          metodo_pago: factura.metodo_pago,
          monto_pagado: factura.monto_pagado,
          estado: factura.estado
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar la factura';
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }
  
  onSubmit(): void {
    if (this.facturaForm.invalid) {
      Object.keys(this.facturaForm.controls).forEach(key => {
        this.facturaForm.get(key)?.markAsTouched();
      });
      
      this.toastr.warning('Por favor completa todos los campos requeridos');
      return;
    }
    
    this.submitting = true;
    
    const facturaActualizada = {
      ...this.facturaForm.value,
      id: this.facturaId
    };
    
    this.facturaService.actualizarFactura(this.facturaId, facturaActualizada).subscribe({
      next: () => {
        this.toastr.success('Factura actualizada correctamente');
        this.submitting = false;
        this.router.navigate(['/facturas']);
      },
      error: (error) => {
        this.error = 'Error al actualizar la factura';
        console.error('Error:', error);
        this.submitting = false;
        this.toastr.error(error.error?.message || this.error);
      }
    });
  }
  
  cancelar(): void {
    this.router.navigate(['/facturas']);
  }
}