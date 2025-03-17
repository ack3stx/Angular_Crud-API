import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HuespedesService } from '../../core/services/huespedes/huespedes.service';
import { CommonModule } from '@angular/common';
import { Huesped } from '../../core/models/huesped';

@Component({
  selector: 'app-huesped',
  templateUrl: './huesped.component.html',
  styleUrls: ['./huesped.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class HuespedComponent implements OnInit {
  huespedForm!: FormGroup;
  huespedes: Huesped[] = [];
  selectedHuesped: Huesped | null = null;
  loading = false;
  error = '';
  showModal = false;

  constructor(
    private fb: FormBuilder,
    private huespedService: HuespedesService
  ) {
    this.initForm();
  }

  private initForm() {
    this.huespedForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadHuespedes();
  }

  loadHuespedes() {
    this.loading = true;
    this.huespedService.getHuespedes().subscribe({
      next: (huespedes) => {
        this.huespedes = huespedes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar huéspedes:', error);
        this.error = 'Error al cargar la lista de huéspedes';
        this.loading = false;
      }
    });
  }

  editHuesped(huesped: Huesped) {
    this.selectedHuesped = huesped;
    this.huespedForm.patchValue(huesped);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedHuesped = null;
    this.huespedForm.reset();
  }

  onSubmit() {
    if (this.huespedForm.valid && this.selectedHuesped) {
      const data = {
        ...this.huespedForm.value,
        id: this.selectedHuesped.id
      };
      
      this.huespedService.actualizarHuesped(data).subscribe({
        next: () => {
          this.loadHuespedes();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.error = 'Error al actualizar el huésped';
        }
      });
    }
  }

  addNewHuesped() {
    this.selectedHuesped = null;
    this.huespedForm.reset();
    this.showModal = true;
  }
}