import { Component } from '@angular/core';

// import { ListingPage } from '../listing/listing';
import { MapsPage } from '../maps/maps';
import { ProfilePage } from '../profile/profile';
import { NotificationsPage } from '../notifications/notifications';

@Component({
  selector: 'tabs-navigation',
  templateUrl: 'tabs-navigation.html'
})
export class TabsNavigationPage {
  tab1Root: any;
  tab2Root: any;
  tab3Root: any;

  constructor() {
    this.tab1Root = MapsPage;
    this.tab2Root = ProfilePage;
    this.tab3Root = NotificationsPage;
  }
}
