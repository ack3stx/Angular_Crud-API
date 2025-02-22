import { Routes } from '@angular/router';
import { LoginComponent } from './Views/auth/login/login.component';
import { RegisterComponent } from './Views/auth/register/register.component';
import { WelcomeComponent } from './Views/welcome/welcome.component';
import { DashboardComponent } from './Views/dashboard/dashboard/dashboard.component';
import { InsertComponent } from './Views/products/insert/insert.component';
import { ShowComponent } from './Views/products/show/show.component';



export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: '',
        component: WelcomeComponent
    },
    {
        path: 'insert',
        component: InsertComponent
    },
    {
        path: 'show',
        component: ShowComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent

        
    }
]