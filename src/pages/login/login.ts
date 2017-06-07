import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';
import { SignupPage } from '../signup/signup';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { Auth, User, FacebookAuth } from '@ionic/cloud-angular';

@Component({
  selector: 'login-page',
  templateUrl: 'login.html'
})
export class LoginPage {
  login: FormGroup;
  main_page: { component: any };
  loading: any;


  constructor(
    public nav: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public auth: Auth,
    public user: User,
    public facebookAuth: FacebookAuth
  ) {
    this.main_page = { component: TabsNavigationPage };

    this.login = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  doLogin() {
    this.showLoader();
    let details = { 'email': this.login.value.email, 'password': this.login.value.password };
    this.auth.login('basic', details).then(userDetails => {
      this.loading.dismiss();
      this.nav.setRoot(this.main_page.component);
    }, err => {
      this.loading.dismiss();
      this.showToast('Authentication failed.');
    });
  }

  doFacebookLogin() {
    this.loading = this.loadingCtrl.create();
    let env = this;
    this.facebookAuth.login().then(facebookAuthResult => {
      env.loading.dismiss();
      env.nav.setRoot(env.main_page.component);
    }, error => {
      console.log(JSON.stringify(error));
    });
  }

  goToSignup() {
    this.nav.push(SignupPage);
  }

  goToForgotPassword() {
    this.nav.push(ForgotPasswordPage);
  }

  private showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  showLoader() {
    this.loading = this.loadingCtrl.create({
      content: "Authenticating..."
    });
    this.loading.present();
  }

}
