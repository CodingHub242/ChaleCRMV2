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
  IonSpinner,
  IonNote
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, logInOutline, personAddOutline } from 'ionicons/icons';

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
    IonNote,
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
    private router: Router
  ) {
    addIcons({ eyeOutline, eyeOffOutline, logInOutline, personAddOutline });
  }

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

  login(): void {
    if (!this.email || !this.password) {
      return;
    }

    this.isLoading = true;
    
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Login error:', error);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
