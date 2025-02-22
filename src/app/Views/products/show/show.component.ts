import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../core/services/products/products.service';

@Component({
  selector: 'app-show',
  imports: [],
  templateUrl: './show.component.html',
  styleUrl: './show.component.css'
})
export class ShowComponent implements OnInit {

  //CREAMOS UN CONSTRUCTOR PARA INYECTAR EL SERVICIO
  constructor(public servicioP:ProductsService) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(){
    this.servicioP.getProducts().subscribe({
      next: (data) => {
        this.servicioP.products = data
      },
      error: (e) => {
        console.log(e);
      }
    })
     
  }

}
