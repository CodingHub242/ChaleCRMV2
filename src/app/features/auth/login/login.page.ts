import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { IonicModule, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    CommonModule, 
    FormsModule
  ]
})
export class LoginPage implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;

   constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit():void{
    // Try to play video after view init
    setTimeout(() => {
      const video = this.videoPlayer?.nativeElement;
      if (video) {
        video.play().catch(err => console.log('Autoplay blocked:', err));
      }
    }, 500);
  }

  onVideoError(event: Event): void {
    console.error('Video failed to load:', event);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async login(): Promise<void> {
    if (!this.email || !this.password) {
      this.showAlert('Error', 'Please enter email and password');
      return;
    }

    this.isLoading = true;
    
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        this.isLoading = false;
        const message = error.error?.message || 'Login failed. Please try again.';
        this.showAlert('Error', message);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  private async showAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
