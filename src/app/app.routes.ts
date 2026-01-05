
import { Routes } from '@angular/router';
import { OrderPos } from './page/order-pos/order-pos';
import { Login } from './login/login';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { AuthLayout } from './shared/layout/auth-layout/auth-layout';
import { RegisterComponent } from './register/register';
import { Customer } from './page/customer/customer';
import { Product } from './page/product/product';
import { Inventory } from './page/inventory/inventory';
import { SumInventoryComponent } from './page/sum-inventory/sum-inventory';
import { WarehouseComponent } from './page/warehouse/warehouse';
import { SuppliersComponent } from './page/suppliers/suppliers';
import { RolesComponent } from './page/roles/roles';
import { adminGuard } from './guard/auth-guard';
import { CreateOrderComponent } from './page/create-order/create-order';
import { DashboardComponent } from './page/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'order-pos', component: OrderPos },
      { path: 'supplier', component: SuppliersComponent },
      { path: 'customer', component: Customer},
      { path: 'product', component: Product},

      { path: 'sumInventory', component: SumInventoryComponent },
      { path: 'inventory', component: Inventory},

      { path: 'warehouse', component: WarehouseComponent},
      {path: 'create-order', component: CreateOrderComponent},

      { path: 'dashboard', component: DashboardComponent},

      { path: 'roles', component: RolesComponent, canActivate: [adminGuard]}

    ]
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: RegisterComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

