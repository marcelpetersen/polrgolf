import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import { TermsOfServicePage } from '../terms-of-service/terms-of-service';
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy';

import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';

import { Auth, UserDetails, IDetailedError, FacebookAuth } from '@ionic/cloud-angular';
import { GoogleLoginService } from '../google-login/google-login.service';

@Component({
  selector: 'signup-page',
  templateUrl: 'signup.html'
})
export class SignupPage {
  signup: FormGroup;
  main_page: { component: any };
  loading: any;

  constructor(
    public nav: NavController,
    public modal: ModalController,
    public googleLoginService: GoogleLoginService,
    public loadingCtrl: LoadingController,
    public auth: Auth,
    public toastCtrl: ToastController,
    public facebookAuth: FacebookAuth
  ) {
    this.main_page = { component: TabsNavigationPage };

    this.signup = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      confirm_password: new FormControl('', Validators.required)
    });
  }

  doSignup() {
    if (!this.signup.valid) {
      this.showToast('Sign up for not valid. Please try again');
      return;
    }

    this.showLoader();
    let userInfo: UserDetails = { 'email': this.signup.value.email, 'password': this.signup.value.confirm_password, 'name': this.signup.value.firstName + ' ' + this.signup.value.lastName };
    let env = this;

    this.auth.signup(userInfo).then((signupResult) => {
      this.auth.login('basic', { 'email': this.signup.value.email, 'password': this.signup.value.confirm_password }).then(() => {
        this.loading.dismiss();
        env.nav.setRoot(env.main_page.component);
      });
    }, (err: IDetailedError<string[]>) => {
      this.loading.dismiss();
      for (let e of err.details) {
        if (e === 'conflict_email') {
          this.showToast('This email already exists.');
        } else {
          // handle other errors
        }
      }
    });

  }

  doFacebookSignup() {
    this.loading = this.loadingCtrl.create();
    let env = this;
    this.facebookAuth.login().then(facebookAuthResult => {
      env.loading.dismiss();
      env.nav.setRoot(env.main_page.component);
    }, error => {
      console.log(JSON.stringify(error));
    });
  }

  doGoogleSignup() {
    this.loading = this.loadingCtrl.create();

    // Here we will check if the user is already logged in because we don't want to ask users to log in each time they open the app
    let env = this;

    this.googleLoginService.trySilentLogin()
      .then(function (data) {
        // user is previously logged with Google and we have his data we will let him access the app
        env.nav.setRoot(env.main_page.component);
      }, function (error) {
        //we don't have the user data so we will ask him to log in
        env.googleLoginService.doGoogleLogin()
          .then(function (res) {
            env.loading.dismiss();
            env.nav.setRoot(env.main_page.component);
          }, function (err) {
            console.log("Google Login error", err);
            env.loading.dismiss();
          });
      });
  }

  showTermsModal() {
    let modal = this.modal.create(TermsOfServicePage);
    modal.present();
  }

  showPrivacyModal() {
    let modal = this.modal.create(PrivacyPolicyPage);
    modal.present();
  }

  showLoader() {
    this.loading = this.loadingCtrl.create({
      content: "Registering..."
    });
    this.loading.present();
  }

  private showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

}
