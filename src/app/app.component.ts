import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, App } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { TabsNavigationPage } from '../pages/tabs-navigation/tabs-navigation';
import { WalkthroughPage } from '../pages/walkthrough/walkthrough';
import { SettingsPage } from '../pages/settings/settings';
import { Auth, User } from '@ionic/cloud-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  // make WalkthroughPage the root (or first) page
  rootPage: any = WalkthroughPage;
  public currentUserName: string;
  public currentUserImage: string;
  // rootPage: any = TabsNavigationPage;


  pages: Array<{ title: string, icon: string, component: any }>;
  pushPages: Array<{ title: string, icon: string, component: any }>;

  constructor(
    platform: Platform,
    public menu: MenuController,
    public app: App,
    public splashScreen: SplashScreen,
    public statusBar: StatusBar,
    private auth: Auth,
    private user: User
  ) {
    platform.ready().then(() => {
      this.splashScreen.hide();
      this.statusBar.styleDefault();
      if (this.auth.isAuthenticated()) {
        this.nav.setRoot(TabsNavigationPage);
        var username = this.user.details.name
        if (username === null) {
          //this is a facebook login
          this.currentUserName = this.user.social.facebook.data.full_name;
          this.currentUserImage = this.user.social.facebook.data.profile_picture;
        } else {
          this.currentUserImage = this.user.details.image;
          this.currentUserName = this.user.details.name;
        }
      }
    });

    this.pages = [
      { title: 'Home', icon: 'home', component: TabsNavigationPage }
      // { title: 'Forms', icon: 'create', component: FormsPage },
      // { title: 'Functionalities', icon: 'code', component: FunctionalitiesPage }
    ];

    this.pushPages = [
      // { title: 'Layouts', icon: 'grid', component: LayoutsPage },
      { title: 'Settings', icon: 'settings', component: SettingsPage }
    ];

  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }

  pushPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // rootNav is now deprecated (since beta 11) (https://forum.ionicframework.com/t/cant-access-rootnav-after-upgrade-to-beta-11/59889)
    this.app.getRootNav().push(page.component);
  }
}
