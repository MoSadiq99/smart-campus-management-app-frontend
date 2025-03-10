import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  imports: [
    RouterLink,
    ReactiveFormsModule,
  ],
  styleUrls: ['./auth-signin.component.scss']
})

export class AuthSigninComponent {
  loginForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthenticationService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log('Sending payload:', { email, password }); // Log the payload
      this.authService.login({ email, password }).subscribe({
        next: (response) => {

          const role: string = response.user.roleName;
          this.redirectBasedOnRole(role);

        },
        error: (err) => {
          console.error('Login failed', err);
        }
      });
    }
  }

  redirectBasedOnRole(role: string) {
    if (role === 'ROLE_ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'ROLE_STUDENT') {
      this.router.navigate(['/student/dashboard']);
    } else if (role === 'ROLE_LECTURER') {
      this.router.navigate(['/lecturer/dashboard']);
    } else {
      this.router.navigate(['/auth/signin']);
    }
  }
}
