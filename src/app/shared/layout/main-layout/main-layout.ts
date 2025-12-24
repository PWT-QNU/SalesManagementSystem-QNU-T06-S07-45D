import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar-component/sidebar-component';
import {HeaderComponent }from '../../components/header-component/header-component';
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet,SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {

}
