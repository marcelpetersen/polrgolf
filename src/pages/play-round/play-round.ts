import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController, ToastController } from 'ionic-angular';
import { Courses } from '../../providers/providers';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ScoreCardPage } from '../score-card/score-card';
import { Auth, User } from '@ionic/cloud-angular';

@Component({
  selector: 'play-round-page',
  templateUrl: 'play-round.html'
})
export class PlayRoundPage {
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
    private navParams: NavParams,
    public modal: ModalController,
    public auth: Auth,
    public user: User,
    public toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private courses: Courses
  ) {

  }

  ngOnInit() {
    this._loading = this.loadingCtrl.create();
    this._loading.present();
    this.course = this.navParams.get('course');
    this.todaysDate = new Date();
    this.selectedCourse = this.course;
    this.selectedTeeBox = this.course.TeeName;
    var env = this;
    this.courses.queryByName({ 'name': this.course.CourseName }).subscribe(courseResult => {
      env.allCourses = courseResult.courses;
      env.courseName = this.course.CourseName;
      env._loading.dismiss();
    });
  }

  updateSelected() {
    console.log('Selected tee box: ' + this.selectedTeeBox);
    this.allCourses.forEach(course => {
      if (course.TeeName === this.selectedTeeBox) {
        this.selectedCourse = course;
      }
    });
  }

  openInAppBrowser(website) {
    this.inAppBrowser.create(website, '_blank', "location=yes");
  }

  showScoreCardModel() {
    // TODO: Need to check auth first. If not logged in then prompt to create account/login.
    if (this.auth.isAuthenticated()) {
      let modal = this.modal.create(ScoreCardPage);
      modal.present();
    } else {
      let toast = this.toastCtrl.create({
        message: 'Please login or signup to continue...',
        duration: 3000
      });
      toast.present();
    }
  }

}
