import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-component.html',
  styleUrls: ['./sidebar-component.css']
})
export class SidebarComponent implements OnInit {

  isAdmin: boolean = false; // Biến để check quyền

  ngOnInit(): void {
    this.checkUserRole();
  }

  checkUserRole() {
    const role = localStorage.getItem('role'); // lấy role từ local

    // Kiểm tra xem có phải admin không
    // Lưu ý: So sánh chuỗi phải khớp với ENUM trong Database ('admin')
    if (role === 'admin') {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
  }
}
