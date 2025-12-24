import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule, NgIf],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const loginData = this.loginForm.value;

    this.http.post<{ token: string }>('http://localhost:8080/api/auth/login', loginData)
      .subscribe({
        next: (res) => {
          const token = res.token;
          localStorage.setItem('jwt', token);

          // Decode payload từ JWT để lấy username, fullName, role
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            localStorage.setItem('username', payload.sub || '');
            localStorage.setItem('fullName', payload.fullName || '');
            localStorage.setItem('role', payload.role || '');
          } catch (err) {
            console.error('Invalid JWT token', err);
          }

          // Chuyển về trang chủ
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.errorMessage = 'Đăng nhập thất bại!';
          console.error(err);
        }
      });
  }
}
