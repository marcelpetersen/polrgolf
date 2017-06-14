import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { EmailComposer } from '@ionic-native/email-composer';
import { ContactModel } from './contact.model';
import { Courses } from '../../providers/providers';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { Geolocation } from '@ionic-native/geolocation';
import { PlayRoundPage } from '../play-round/play-round';

@Component({
  selector: 'contact-card-page',
  templateUrl: 'contact-card.html'
})
export class ContactCardPage {
  contact: ContactModel = new ContactModel();
  course: any;
  destination: string;
  start: string;
  _loading: any;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public callNumber: CallNumber,
    private emailComposer: EmailComposer,
    public inAppBrowser: InAppBrowser,
    navParams: NavParams,
    courses: Courses,
    public geolocation: Geolocation,
    private launchNavigator: LaunchNavigator
  ) {
    this._loading = this.loadingCtrl.create();
    this._loading.present();
    this.course = navParams.get('course');
    courses.query({ 'id': this.course._id }).subscribe(courseResult => {
      this.course = courseResult;
      if (this.course.main_photo == undefined) {
        this.course.main_photo = 'http://res.cloudinary.com/zendoks/image/upload/v1496289734/courses/pexels-photo-28276.jpg';
      }
      this._loading.dismiss();
    });
  }

  call(number: string) {
    this.callNumber.callNumber(number, true)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'));
  }

  startRound() {
    this.navCtrl.push(PlayRoundPage, { course: this.course });
  }

  launchMaps() {
    this.geolocation.getCurrentPosition().then((position) => {
      let options: LaunchNavigatorOptions = {
        start: position.coords.latitude + ',' + position.coords.longitude
      };
      let location = this.course.StreetAddress + ' ' + this.course.City + ' ' + this.course.StateorRegion + ' ' + this.course.Zip;
      this.launchNavigator.navigate(location, options)
        .then(
        success => console.log('Launched navigator'),
        error => console.log('Error launching navigator', error)
        );
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  openInAppBrowser(website) {
    this.inAppBrowser.create(website, '_blank', "location=yes");
  }

}
