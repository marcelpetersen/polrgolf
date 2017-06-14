import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ScoreCards } from '../../providers/providers';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { User } from '@ionic/cloud-angular';

@Component({
  selector: 'score-card-page',
  templateUrl: 'score-card.html'
})
export class ScoreCardPage {
  course: any;
  selectedCourse: any;
  courseName: string;
  todaysDate: Date;
  allCourses: any[];
  _loading: any;
  selectedTeeBox: string;


  constructor(
    private navCtrl: NavController,
    public inAppBrowser: InAppBrowser,
    public user: User,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private scorecards: ScoreCards
  ) {
    console.log('User id: ' + this.user.id);
  }

  ngOnInit() {
    // this._loading = this.loadingCtrl.create();
    // this._loading.present();
    // this.course = this.navParams.get('course');

  }

}
