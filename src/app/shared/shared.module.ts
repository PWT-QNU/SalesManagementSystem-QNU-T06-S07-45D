import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Import các component standalone
import { SidebarComponent } from './components/sidebar-component/sidebar-component';
import { HeaderComponent } from './components/header-component/header-component';
import { TabComponent } from './components/tab-component/tab-component';
import { FooterComponent } from './components/footer-component/footer-component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    // Import trực tiếp các standalone component
    SidebarComponent,
    HeaderComponent,
    TabComponent,
    FooterComponent,
  ],
  exports: [
    SidebarComponent,
    HeaderComponent,
    TabComponent,
    FooterComponent,
  ],
})
export class SharedModule {}
