import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
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

          const roles: string [] = response.roles;
          this.redirectBasedOnRole(roles);

        },
        error: (err) => {
          console.error('Login failed', err);
        }
      });
    }
  }

  redirectBasedOnRole(roles: string []) {
    if (roles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (roles.includes('ROLE_FARMER')) {
      this.router.navigate(['/farmer/dashboard']);
    } else if (roles.includes('ROLE_BUYER')) {
      this.router.navigate(['/buyer/dashboard']);
    } else {
      this.router.navigate(['/auth/signin']);
    }
  }
}
