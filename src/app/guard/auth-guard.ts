import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = localStorage.getItem('role'); // Lấy role từ local storage

  if (role === 'admin') {
    return true; // Cho phép vào
  } else {
    alert('Bạn không có quyền truy cập trang này!');
    router.navigate(['/']); // Đá về trang chủ
    return false;
  }
};