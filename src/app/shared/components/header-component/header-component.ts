import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './header-component.html',
  styleUrls: ['./header-component.css']
})
export class HeaderComponent implements OnInit {
  username: string = '';
  fullName: string = '';

  constructor(private router: Router) {}

 ngOnInit() {
  this.username = localStorage.getItem('username') || '';
  this.fullName = localStorage.getItem('fullName') || '';
}
  loadUserInfo() {
    this.username = localStorage.getItem('username') || '';
    this.fullName = localStorage.getItem('fullName') || '';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    localStorage.clear();
    this.username = '';
    this.fullName = '';
    this.router.navigate(['/']);
  }
}
