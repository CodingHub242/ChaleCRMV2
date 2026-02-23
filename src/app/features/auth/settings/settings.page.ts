import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonNote,
  IonMenuButton,
  IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, businessOutline, saveOutline, shieldOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { User, Organization } from '../../../models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonSegment,
    IonSegmentButton,
    IonNote,
    IonMenuButton,
    IonAvatar,
    CommonModule, 
    FormsModule
  ]
})
export class SettingsPage implements OnInit {
  selectedSegment = 'profile';
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  // Profile fields
  profileName = '';
  profileEmail = '';
  profilePhone = '';
  profileAvatar = '';

  // Organization fields
  orgName = '';
  orgEmail = '';
  orgPhone = '';
  orgAddress = '';
  orgCity = '';
  orgState = '';
  orgCountry = '';
  orgZipCode = '';
  orgWebsite = '';

  constructor(
    private authService: AuthService
  ) {
    addIcons({ personOutline, businessOutline, saveOutline, shieldOutline });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    if (this.authService.isAdmin) {
      this.loadOrganization();
    }
  }

  loadUserProfile(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.profileName = user.name;
      this.profileEmail = user.email;
      this.profilePhone = user.phone || '';
      this.profileAvatar = user.avatar || '';
    }
  }

  loadOrganization(): void {
    const org = this.authService.currentOrganization;
    if (org) {
      this.orgName = org.name;
      this.orgEmail = org.email || '';
      this.orgPhone = org.phone || '';
      this.orgAddress = org.address || '';
      this.orgCity = org.city || '';
      this.orgState = org.state || '';
      this.orgCountry = org.country || '';
      this.orgZipCode = org.zip_code || '';
      this.orgWebsite = org.website || '';
    }
  }

  saveProfile(): void {
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    // In a real app, you'd call an API to update the profile
    // For now, we'll just simulate it
    setTimeout(() => {
      const user = this.authService.currentUser;
      if (user) {
        // Update local storage
        const updatedUser = { 
          ...user, 
          name: this.profileName,
          phone: this.profilePhone 
        };
        localStorage.setItem('bigin_user', JSON.stringify(updatedUser));
        this.authService.refreshUser();
      }
      
      this.isSaving = false;
      this.successMessage = 'Profile updated successfully!';
      setTimeout(() => this.successMessage = '', 3000);
    }, 1000);
  }

  saveOrganization(): void {
    if (!this.authService.isAdmin) {
      this.errorMessage = 'Only admins can update organization settings';
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const data = {
      name: this.orgName,
      email: this.orgEmail || undefined,
      phone: this.orgPhone || undefined,
      address: this.orgAddress || undefined,
      city: this.orgCity || undefined,
      state: this.orgState || undefined,
      country: this.orgCountry || undefined,
      zip_code: this.orgZipCode || undefined,
      website: this.orgWebsite || undefined
    };

    // Call API to update organization
    this.authService.createOrganization(data).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Organization updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Failed to update organization';
      }
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  get userInitials(): string {
    return this.profileName?.charAt(0).toUpperCase() || 'U';
  }
}
