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
  IonModal,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonAvatar,
  IonMenuButton,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, mailOutline, callOutline, trashOutline, shieldOutline, peopleOutline, closeOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models';

@Component({
  selector: 'app-team-invite',
  templateUrl: './team-invite.page.html',
  styleUrls: ['./team-invite.page.scss'],
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
    IonModal,
    IonSelect,
    IonSelectOption,
    IonBadge,
    IonRefresher,
    IonRefresherContent,
    IonAvatar,
    IonMenuButton,
    IonSpinner,
    CommonModule, 
    FormsModule
  ]
})
export class TeamInvitePage implements OnInit {
  public users: User[] = [];
  public isLoading = false;
  public isInviteModalOpen = false;
  public isLoadingUsers = false;

  // Invite form
  public inviteName = '';
  public inviteEmail = '';
  public invitePhone = '';
  public inviteRole = 'user';

  constructor(
    public authService: AuthService
  ) {
    addIcons({ 
      personAddOutline, 
      mailOutline, 
      callOutline, 
      trashOutline, 
      shieldOutline, 
      peopleOutline,
      closeOutline
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.authService.getOrganizationUsers().subscribe({
      next: (response) => {
        this.users = response.data || [];
        this.isLoadingUsers = false;
      },
      error: () => {
        this.isLoadingUsers = false;
      }
    });
  }

  openInviteModal(): void {
    this.isInviteModalOpen = true;
    this.resetInviteForm();
  }

  closeInviteModal(): void {
    this.isInviteModalOpen = false;
    this.resetInviteForm();
  }

  resetInviteForm(): void {
    this.inviteName = '';
    this.inviteEmail = '';
    this.invitePhone = '';
    this.inviteRole = 'user';
  }

  sendInvite(): void {
    if (!this.inviteName || !this.inviteEmail) {
      return;
    }

    this.isLoading = true;

    const data = {
      name: this.inviteName,
      email: this.inviteEmail,
      phone: this.invitePhone || undefined,
      role: this.inviteRole
    };

    this.authService.inviteUser(data).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.closeInviteModal();
        this.loadUsers();
        
        // Show the temporary password to the admin (in production, this would be sent via email)
        const tempPassword = response.data?.temporary_password;
        if (tempPassword) {
          alert(`User invited successfully!\n\nTemporary password: ${tempPassword}\n\nPlease share this password with the user.`);
        }
      },
      error: (error) => {
        this.isLoading = false;
        alert(error?.error?.message || 'Failed to invite user');
      }
    });
  }

  updateUserRole(userId: number, newRole: string): void {
    this.authService.updateUserRole(userId, newRole).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        alert(error?.error?.message || 'Failed to update role');
      }
    });
  }

  removeUser(userId: number): void {
    if (confirm('Are you sure you want to remove this user from the organization?')) {
      this.authService.removeUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          alert(error?.error?.message || 'Failed to remove user');
        }
      });
    }
  }

  getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      default: return 'medium';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      default: return 'User';
    }
  }

  getUserInitials(user: User): string {
    return user.name?.charAt(0)?.toUpperCase() || 'U';
  }

  get currentUserId(): number | undefined {
    return this.authService.currentUser?.id;
  }

  canManageUsers(): boolean {
    return this.authService.isAdminOrManager;
  }

  canManageRoles(): boolean {
    return this.authService.isAdmin;
  }
}
