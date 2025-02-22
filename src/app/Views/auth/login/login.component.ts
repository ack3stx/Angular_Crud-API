import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  router = inject(Router);
  http = inject(HttpClient);


  apiLogin: any = {
    email: '',
    password: ''
  }

  onlogin() {
    this.http.post('http://127.0.0.1:8000/api/v1/login', this.apiLogin).subscribe((data) => {
      alert('Login Successful');
  }, (error) => {
    alert('Invalid Credentials');
  });
}
}
