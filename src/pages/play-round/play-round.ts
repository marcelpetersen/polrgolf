import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { EmailComposer } from '@ionic-native/email-composer';
import { PlayRoundModel } from './playround.model';
import { Courses } from '../../providers/providers';

@Component({
  selector: 'play-round-page',
  templateUrl: 'play-round.html'
})
export class PlayRoundPage {
  playRoundModel: PlayRoundModel = new PlayRoundModel();
  course: any;
  todaysDate: Date;

  constructor(
    public navCtrl: NavController,
    public callNumber: CallNumber,
    private emailComposer: EmailComposer,
    public inAppBrowser: InAppBrowser,
    navParams: NavParams,
    courses: Courses
  ) {
    //TODO: Need to call course api endpoint to get more details
    this.course = navParams.get('course');
    this.todaysDate = new Date();
    courses.query({ 'id': this.course._id }).subscribe(courseResult => {
      this.course = courseResult;
      if (this.course.main_photo == undefined) {
        this.course.main_photo = 'http://res.cloudinary.com/zendoks/image/upload/v1496289734/courses/pexels-photo-28276.jpg';
      }
    });
  }

  startRound() {
    //coming soon
  }

  openInAppBrowser(website) {
    this.inAppBrowser.create(website, '_blank', "location=yes");
  }

}
