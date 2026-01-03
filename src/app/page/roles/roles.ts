import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, UserService } from '../../services/users/user';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css']
})
export class RolesComponent implements OnInit {

  users: User[] = [];
  filteredUsers: User[] = [];
  searchKeyword: string = '';

  // Danh sách quyền cứng (theo Enum DB)
  availableRoles = [
    { value: 'admin', label: 'Quản trị viên (Admin)' },
    { value: 'sales', label: 'Nhân viên (Sales)' },
    { value: 'customer', label: 'Khách hàng (Customer)' }
  ];

  // Modal
  showModal: boolean = false;
  currentUser: User = { id: 0, username: '', fullName: '', role: 'customer' };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.search();
      },
      error: (err) => console.error(err)
    });
  }

  search() {
    const term = this.searchKeyword.toLowerCase();
    if (!term) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(u => 
        u.username.toLowerCase().includes(term) ||
        (u.fullName && u.fullName.toLowerCase().includes(term)) ||
        u.role.toLowerCase().includes(term)
      );
    }
  }

  // Mở form sửa quyền
  openEdit(user: User) {
    this.currentUser = { ...user };
    this.showModal = true;
  }

  closeForm() {
    this.showModal = false;
  }

  // Lưu thay đổi
  saveUser() {
    if (!this.currentUser.fullName) {
      alert('Vui lòng nhập họ tên');
      return;
    }

    // Gọi API update
    this.userService.update(this.currentUser.id, this.currentUser).subscribe({
      next: () => {
        alert('Cập nhật quyền thành công!');
        this.loadUsers();
        this.closeForm();
      },
      error: (err) => alert('Lỗi cập nhật: ' + err.message)
    });
  }

  // Xóa tài khoản
  deleteUser(id: number) {
    if (confirm('Bạn có chắc muốn xóa tài khoản này? Hành động không thể hoàn tác.')) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => alert('Không thể xóa tài khoản này.')
      });
    }
  }

  // Helper để lấy class màu cho badge
  getRoleClass(role: string): string {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'sales': return 'role-sales';
      default: return 'role-customer';
    }
  }
}