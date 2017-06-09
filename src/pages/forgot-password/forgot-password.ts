import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Auth } from '@ionic/cloud-angular';

import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';

@Component({
  selector: 'forgot-password-page',
  templateUrl: 'forgot-password.html'
})
export class ForgotPasswordPage {
  forgot_password: FormGroup;
  main_page: { component: any };

  constructor(public nav: NavController, public auth: Auth) {
    this.main_page = { component: TabsNavigationPage };

    this.forgot_password = new FormGroup({
      email: new FormControl('', Validators.required)
    });
  }

  recoverPassword() {
    this.auth.requestPasswordReset(this.forgot_password.value);
    this.nav.setRoot(this.main_page.component);
  }

}
