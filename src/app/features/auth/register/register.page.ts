import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonCheckbox, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonCheckbox, IonSpinner, IonIcon, CommonModule, FormsModule]
})
export class RegisterPage implements OnInit {
  name = '';
  email = '';
  company = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;
  isLoading = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private apiService: ApiService
  ) {
    addIcons({ eye, eyeOff });
  }

  ngOnInit() {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  async register() {
    // Validation
    if (!this.name.trim()) {
      this.showError('Please enter your name');
      return;
    }

    if (!this.email.trim()) {
      this.showError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.showError('Please enter a valid email address');
      return;
    }

    if (!this.password) {
      this.showError('Please enter a password');
      return;
    }

    if (this.password.length < 6) {
      this.showError('Password must be at least 6 characters');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    if (!this.acceptTerms) {
      this.showError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    this.isLoading = true;

    const registerData = {
      name: this.name,
      email: this.email,
      company: this.company,
      password: this.password,
      password_confirmation: this.confirmPassword
    };

    this.apiService.register(registerData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.showSuccess('Account created successfully! Please login.');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.showError(response.message || 'Registration failed');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        if (error.error && error.error.errors) {
          const errors = error.error.errors;
          const firstError = Object.values(errors)[0];
          this.showError(Array.isArray(firstError) ? firstError[0] : 'Registration failed');
        } else {
          this.showError('Registration failed. Please try again.');
        }
      }
    });
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showSuccess(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }
}
