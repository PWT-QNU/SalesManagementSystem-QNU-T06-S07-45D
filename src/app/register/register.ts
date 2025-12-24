import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { Services } from '../services';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule, NgIf],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private services: Services,   private router: Router ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      fullName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer', Validators.required]

    });
  }
ngOnInit(): void {}

  onSubmit() {
    if (this.registerForm.invalid) return;

    const data = this.registerForm.value;

    this.http.post<{ token: string, username: string, fullName: string, role: string }>(
      `${this.services.apiUrl}/api/auth/signup`, data
    ).subscribe({
      next: (res) => {
        this.successMessage = 'Đăng ký thành công!';
        this.errorMessage = '';

        // Lưu token
        localStorage.setItem('jwt', res.token);

        // Lưu thông tin user
        localStorage.setItem('username', res.username);
        localStorage.setItem('fullName', res.fullName);
        localStorage.setItem('role', res.role);


        // Chuyển hướng về trang chủ
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message || 'Đăng ký thất bại!';
        this.successMessage = '';
      }
    });
  }
}
