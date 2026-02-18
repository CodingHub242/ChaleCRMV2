import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, peopleOutline, businessOutline, trendingUpOutline, checkboxOutline, calendarOutline, cubeOutline, documentTextOutline, receiptOutline, logOutOutline, menuOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    // Register global icons
    // addIcons({
    //   homeOutline,
    //   peopleOutline,
    //   businessOutline,
    //   trendingUpOutline,
    //   checkboxOutline,
    //   calendarOutline,
    //   cubeOutline,
    //   documentTextOutline,
    //   receiptOutline,
    //   logOutOutline,
    //   menuOutline
    // });
  }
}
