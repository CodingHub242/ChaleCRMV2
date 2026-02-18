import { Component, OnInit,HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonIcon, IonLabel, IonItemDivider, IonButton, IonButtons } from '@ionic/angular/standalone';
import { IonicModule, MenuController, NavController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, businessOutline, homeOutline, peopleOutline, trendingUpOutline, checkboxOutline, calendarOutline, cubeOutline, documentTextOutline, receiptOutline } from 'ionicons/icons';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.page.html',
  styleUrls: ['./main-layout.page.scss'],
  standalone: true,
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonIcon, IonLabel, IonItemDivider, IonButton, IonButtons, CommonModule, FormsModule, RouterModule]
})
export class MainLayoutPage implements OnInit {
 currentUser: any;
  sidebarOpen = false;
  isMobile = false;

  constructor(
    private menuController: MenuController,
    private authService: AuthService,
    private router: Router
  ) {
      addIcons({briefcase,notificationsOutline,settingsOutline,trendingUp,cash,chevronBack,chevronForward,chevronDown,alertCircle, add, trash, cubeOutline,documentTextOutline,receiptOutline, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, checkboxOutline,calendarOutline,checkmarkCircle,cloudUpload,layers,time,person,logOut,list,calendar,analytics,people,flag,homeOutline,peopleOutline,trendingUpOutline,ellipse,businessOutline});
     }

 ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    // On desktop, sidebar is always visible
    if (!this.isMobile) {
      this.sidebarOpen = true;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  closeSidebarOnMobile() {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) return '?';
    const names = this.currentUser.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }

}
