import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController, ToastController, AlertController } from 'ionic-angular';
import { Courses } from '../../providers/providers';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ScoreCardPage } from '../score-card/score-card';
import { Auth, User } from '@ionic/cloud-angular';
import { ScoreCards } from '../../providers/providers';

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
    public alertCtrl: AlertController,
    public auth: Auth,
    public user: User,
    public toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private courses: Courses,
    private scorecards: ScoreCards
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
    var env = this;
    if (this.auth.isAuthenticated()) {
      this.scorecards.findIncomplete(this.user.id).subscribe(scorecardResults => {
        if (scorecardResults.scorecards.length > 0) {
          let confirm = this.alertCtrl.create({
            title: 'Incomplete scorecard detected!',
            message: 'Please discard the incomplete scorecard or open it to continue your round at ' + scorecardResults.scorecards[0].CourseName + '.',
            buttons: [
              {
                text: 'Discard',
                handler: () => {
                  scorecardResults.scorecards[0].IsCompleted = true;
                  scorecardResults.scorecards[0].IsDiscarded = true;
                  env.scorecards.update(scorecardResults.scorecards[0]).subscribe(updateResult => {
                    let modal = this.modal.create(ScoreCardPage, { selectedCourse: env.selectedCourse });
                    modal.present();
                  });
                }
              },
              {
                text: 'Open',
                handler: () => {
                  let modal = this.modal.create(ScoreCardPage, { incompleteScoreCardId: scorecardResults.scorecards[0]._id });
                  modal.present();
                }
              }
            ]
          });
          confirm.present();
          return;
        } else {
          let modal = this.modal.create(ScoreCardPage, { selectedCourse: env.selectedCourse });
          modal.present();
        }
      });
    } else {
      let toast = this.toastCtrl.create({
        message: 'Please login or signup to continue...',
        duration: 3000
      });
      toast.present();
    }
  }
}
