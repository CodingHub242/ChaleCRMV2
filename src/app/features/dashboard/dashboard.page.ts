import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonMenuButton, IonIcon, IonRow, IonCol, IonModal, IonLabel, IonItem, IonDatetime } from '@ionic/angular/standalone';
//import { ModalController } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline } from 'ionicons/icons';

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  otherMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  type: 'call' | 'meeting' | 'email' | 'task' | 'deadline';
  time?: string;
  date: Date;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonButton,IonButtons,IonIcon,IonModal,IonRow,IonCol,IonMenuButton, IonLabel, IonItem, IonDatetime, CommonModule, FormsModule, RouterModule]
})
export class DashboardPage implements OnInit {
stats: any = {
    total_contacts: 0,
    total_companies: 0,
    total_deals: 0,
    total_deals_value: 0,
    won_deals: 0,
    won_deals_value: 0,
    recent_activities: []
  };

  pipelineStages = [
    { name: 'New Lead', count: 0, value: 0, percentage: 0, deals: [] as any[] },
    { name: 'Qualified', count: 0, value: 0, percentage: 0, deals: [] as any[] },
    { name: 'Proposal', count: 0, value: 0, percentage: 0, deals: [] as any[] },
    { name: 'Negotiation', count: 0, value: 0, percentage: 0, deals: [] as any[] },
    { name: 'Closed Won', count: 0, value: 0, percentage: 0, deals: [] as any[] }
  ];

  // Location-based grouping
  locationGroups: any[] = [];
  selectedLocation: any = null;
  showLocationModal = false;

  // Pipeline modal
  selectedStageDeals: any[] = [];
  selectedStageName = '';
  showPipelineModal = false;

  currentUserName = 'User';

  // Calendar
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  currentDate = new Date();
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  calendarDays: CalendarDay[] = [];
  selectedDate: Date | null = null;
  selectedDateEvents: CalendarEvent[] = [];
  allEvents: CalendarEvent[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
   // private modalController: ModalController
  ) {
    addIcons({briefcase,notificationsOutline,settingsOutline,trophyOutline,trendingUp,cash,chevronBack,chevronForward,chevronDown,alertCircle, add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter,checkmarkCircle,cloudUpload,layers,time,person,logOut,list,calendar,analytics,people,flag,folderOpen,ellipse,business,callOutline,chatbubbleOutline,calendarOutline});
  }

   ngOnInit() {
    this.loadStats();
    this.loadPipelineData();
    this.loadCurrentUser();
    this.loadLocationData();
    
    // Initialize calendar to current month/year
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    this.selectedDate = new Date();
    
    this.loadEvents();
  }

  loadStats() {
    this.api.getDashboardStats().subscribe({
      next: (data: any) => {
        this.stats = { ...this.stats, ...data };
        this.calculatePipelinePercentages();
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        // Use sample data for demo
        this.stats = {
          total_contacts: 156,
          total_companies: 42,
          total_deals: 89,
          total_deals_value: 245000,
          won_deals: 12,
          won_deals_value: 85000,
          recent_activities: [
            { type: 'call', title: 'Call with ABC Corp', description: 'Discussed pricing', created_at: new Date() },
            { type: 'meeting', title: 'Team Meeting', description: 'Weekly sync', created_at: new Date() },
            { type: 'email', title: 'Email sent', description: 'Follow up with lead', created_at: new Date() }
          ]
        };
        this.calculatePipelinePercentages();
      }
    });
  }

  loadPipelineData() {
    this.api.getDeals().subscribe({
      next: (response: any) => {
        const deals = response.data || response;
        if (deals && deals.length > 0) {
          this.processPipelineData(deals);
        }
      },
      error: (err) => {
        console.error('Error loading pipeline:', err);
        // Use sample data
        this.pipelineStages = [
          { name: 'New Lead', count: 15, value: 45000, percentage: 0, deals: this.generateSampleDeals('new', 15) },
          { name: 'Qualified', count: 12, value: 68000, percentage: 0, deals: this.generateSampleDeals('qualified', 12) },
          { name: 'Proposal', count: 8, value: 52000, percentage: 0, deals: this.generateSampleDeals('proposal', 8) },
          { name: 'Negotiation', count: 5, value: 38000, percentage: 0, deals: this.generateSampleDeals('negotiation', 5) },
          { name: 'Closed Won', count: 12, value: 85000, percentage: 0, deals: this.generateSampleDeals('won', 12) }
        ];
        this.calculatePipelinePercentages();
      }
    });
  }

  generateSampleDeals(stage: string, count: number): any[] {
    const companies = ['ABC Corp', 'XYZ Inc', 'Tech Solutions', 'Global Ltd', 'Innovation Co', 'Digital Dynamics', 'Smart Systems', 'Enterprise Group'];
    const deals = [];
    for (let i = 0; i < count; i++) {
      deals.push({
        id: i + 1,
        name: `Deal ${i + 1} - ${companies[i % companies.length]}`,
        company: companies[i % companies.length],
        amount: Math.floor(Math.random() * 50000) + 5000,
        stage: stage,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    return deals;
  }

  loadLocationData() {
    // Load contacts to group by location
    this.api.getContacts().subscribe({
      next: (response: any) => {
        const contacts = response.data || response;
        if (contacts && contacts.length > 0) {
          this.processLocationData(contacts);
        }
      },
      error: (err) => {
        console.error('Error loading location data:', err);
        // Use sample location data
        this.locationGroups = this.generateSampleLocationData();
      }
    });
  }

  processLocationData(contacts: any[]) {
    const locationMap: { [key: string]: { count: number, value: number, contacts: any[] } } = {};

    contacts.forEach(contact => {
      const country = contact.country || contact.city || 'Unknown';
      const location = contact.state ? `${contact.state}, ${country}` : country;

      if (!locationMap[location]) {
        locationMap[location] = { count: 0, value: 0, contacts: [] };
      }
      locationMap[location].count++;
      locationMap[location].contacts.push(contact);
    });

    this.locationGroups = Object.entries(locationMap)
      .map(([location, data]) => ({
        location,
        count: data.count,
        contacts: data.contacts
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 locations
  }

  generateSampleLocationData(): any[] {
    return [
      { location: 'Accra, Ghana', count: 45, contacts: [] },
      { location: 'Lagos, Nigeria', count: 32, contacts: [] },
      { location: 'Nairobi, Kenya', count: 28, contacts: [] },
      { location: 'Johannesburg, South Africa', count: 24, contacts: [] },
      { location: 'Kumasi, Ghana', count: 18, contacts: [] },
      { location: 'Abidjan, Ivory Coast', count: 15, contacts: [] },
      { location: 'Kampala, Uganda', count: 12, contacts: [] },
      { location: 'Other', count: 20, contacts: [] }
    ];
  }

  processPipelineData(deals: any[]) {
    const stageMap: { [key: string]: number } = {
      'new': 0,
      'qualified': 1,
      'proposal': 2,
      'negotiation': 3,
      'won': 4
    };

    // Reset stages
    this.pipelineStages = [
      { name: 'New Lead', count: 0, value: 0, percentage: 0, deals: [] as any[] },
      { name: 'Qualified', count: 0, value: 0, percentage: 0, deals: [] as any[] },
      { name: 'Proposal', count: 0, value: 0, percentage: 0, deals: [] as any[] },
      { name: 'Negotiation', count: 0, value: 0, percentage: 0, deals: [] as any[] },
      { name: 'Closed Won', count: 0, value: 0, percentage: 0, deals: [] as any[] }
    ];

    deals.forEach(deal => {
      const stageIndex = stageMap[deal.stage?.toLowerCase()] ?? 0;
      if (this.pipelineStages[stageIndex]) {
        this.pipelineStages[stageIndex].count++;
        this.pipelineStages[stageIndex].value += deal.amount || 0;
        this.pipelineStages[stageIndex].deals.push(deal);
      }
    });

    this.calculatePipelinePercentages();
  }

  calculatePipelinePercentages() {
    const totalValue = this.pipelineStages.reduce((sum, stage) => sum + stage.value, 0);
    if (totalValue > 0) {
      this.pipelineStages.forEach(stage => {
        stage.percentage = Math.round((stage.value / totalValue) * 100);
      });
    }
  }

  loadCurrentUser() {
    const user = this.auth.currentUser;
    if (user) {
      this.currentUserName = user.name || 'User';
    }
  }

  formatCurrency(value: number): string {
    if (!value) return 'GHS0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getWonPercentage(): number {
    if (!this.stats.total_deals) return 0;
    return Math.round((this.stats.won_deals / this.stats.total_deals) * 100);
  }

  getStageWidth(value: number): number {
    const maxValue = Math.max(...this.pipelineStages.map(s => s.value));
    if (!maxValue) return 0;
    return (value / maxValue) * 100;
  }

  // Open pipeline stage modal
  openPipelineStage(stage: any) {
    this.selectedStageName = stage.name;
    this.selectedStageDeals = stage.deals || [];
    this.showPipelineModal = true;
  }

  closePipelineModal() {
    this.showPipelineModal = false;
  }

  // Open location modal
  openLocation(location: any) {
    this.selectedLocation = location;
    this.showLocationModal = true;
  }

  closeLocationModal() {
    this.showLocationModal = false;
  }

  getTotalLocationContacts(): number {
    return this.locationGroups.reduce((sum, loc) => sum + loc.count, 0);
  }

  // Calendar Methods
  get currentMonthYear(): string {
    const date = new Date(this.currentYear, this.currentMonth);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  initCalendar() {
    this.calendarDays = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const today = new Date();
    
    // Previous month days
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: prevMonthLastDay - i,
        month: this.currentMonth - 1,
        year: this.currentYear,
        otherMonth: true,
        isToday: false,
        events: []
      });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(this.currentYear, this.currentMonth, i);
      const isToday = dayDate.toDateString() === today.toDateString();
      this.calendarDays.push({
        date: i,
        month: this.currentMonth,
        year: this.currentYear,
        otherMonth: false,
        isToday: isToday,
        events: this.getEventsForDate(dayDate)
      });
    }
    
    // Next month days
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: i,
        month: this.currentMonth + 1,
        year: this.currentYear,
        otherMonth: true,
        isToday: false,
        events: []
      });
    }
    
    // Auto-select today if no date is selected
    if (!this.selectedDate) {
      this.selectedDate = today;
      this.updateSelectedDateEvents();
    }
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.initCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.initCalendar();
  }

  loadEvents() {
    // Load activities
    this.api.getActivities().subscribe({
      next: (response: any) => {
        const activities = response.data || response;
        if (activities && activities.length > 0) {
          activities.forEach((activity: any) => {
            if (activity.due_date) {
              this.allEvents.push({
                id: activity.id,
                title: activity.title || activity.subject || 'Activity',
                description: activity.description,
                type: this.mapActivityType(activity.type),
                time: activity.time || 'All day',
                date: new Date(activity.due_date)
              });
            }
          });
        }
        // Initialize calendar after events are loaded
        this.initCalendar();
        this.updateSelectedDateEvents();
      },
      error: () => {
        // Use sample events
        this.generateSampleEvents();
        // Initialize calendar after events are loaded
        this.initCalendar();
        this.updateSelectedDateEvents();
      }
    });
  }

  generateSampleEvents() {
    const eventTypes: Array<'call' | 'meeting' | 'email' | 'task' | 'deadline'> = ['call', 'meeting', 'email', 'task', 'deadline'];
    const eventTitles = [
      { type: 'call' as const, title: 'Call with client' },
      { type: 'meeting' as const, title: 'Team meeting' },
      { type: 'email' as const, title: 'Follow up email' },
      { type: 'task' as const, title: 'Complete proposal' },
      { type: 'deadline' as const, title: 'Deal closing' }
    ];
    
    // Generate events for the next 30 days
    for (let i = 0; i < 15; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 30));
      randomDate.setHours(Math.floor(Math.random() * 8) + 9, 0, 0);
      
      const eventData = eventTitles[Math.floor(Math.random() * eventTitles.length)];
      this.allEvents.push({
        id: i + 1,
        title: eventData.title,
        description: 'Sample event description',
        type: eventData.type,
        time: `${randomDate.getHours()}:00`,
        date: randomDate
      });
    }
  }

  mapActivityType(type: string): 'call' | 'meeting' | 'email' | 'task' | 'deadline' {
    const typeMap: { [key: string]: 'call' | 'meeting' | 'email' | 'task' | 'deadline' } = {
      'call': 'call',
      'meeting': 'meeting',
      'email': 'email',
      'task': 'task',
      'deadline': 'deadline'
    };
    return typeMap[type?.toLowerCase()] || 'task';
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  selectDate(day: CalendarDay) {
    this.selectedDate = new Date(day.year, day.month, day.date);
    this.updateSelectedDateEvents();
  }

  updateSelectedDateEvents() {
    if (this.selectedDate) {
      this.selectedDateEvents = this.getEventsForDate(this.selectedDate);
    }
  }

  getEventIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'call': 'call-outline',
      'meeting': 'people-outline',
      'email': 'mail-outline',
      'task': 'checkbox-outline',
      'deadline': 'flag-outline'
    };
    return iconMap[type] || 'calendar-outline';
  }

}
