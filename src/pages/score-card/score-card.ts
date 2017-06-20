import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { ScoreCards } from '../../providers/providers';
import { Courses } from '../../providers/providers';
import { HoleNotes } from '../../providers/providers';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { User } from '@ionic/cloud-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';

@Component({
  selector: 'score-card-page',
  templateUrl: 'score-card.html'
})
export class ScoreCardPage {
  course: any = {};
  _loading: any;
  currentHole: number = 1;
  currentHolePar: number;
  currentHoleLength: number;
  currentHoleHandicap: number;
  scorecard: any = {};
  currentScore: number = 1;
  currentPutts: number = 1;
  runningScore: number = 0;
  runningPutts: number = 0;
  runningScoreFront9: number = 0;
  runningScoreBack9: number = 0;
  runningPuttsFront9: number = 0;
  runningPuttsBack9: number = 0;
  scoreSection: string = 'scorecard';
  speechRecognitionIsAvailable: boolean = false;
  isListening: boolean;
  speechNotes: string;
  showFireworks: boolean = false;
  main_page: { component: any };

  constructor(
    private navCtrl: NavController,
    public inAppBrowser: InAppBrowser,
    public user: User,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private scorecards: ScoreCards,
    public courses: Courses,
    public holeNotes: HoleNotes,
    private speechRecognition: SpeechRecognition
  ) {
    this.main_page = { component: TabsNavigationPage };
    this._loading = this.loadingCtrl.create();
    this._loading.present();
    var env = this;
    env.isListening = false;
    env.speechRecognition.isRecognitionAvailable()
      .then((available: boolean) => env.speechRecognitionIsAvailable = available);
    if (this.navParams.get('selectedCourse')) {
      // Start new round...
      this.course = this.navParams.get('selectedCourse');
      this.currentHoleHandicap = this.course['Hdcp 1'];
      this.currentHoleLength = this.course.Hole_1;
      this.currentHolePar = this.course.Par_1;
      this.scorecard = {
        PlayerName: this.user.details.name,
        UserId: this.user.id,
        CourseName: this.course.CourseName,
        CourseId: this.course._id
      };
      this.scorecards.create(this.scorecard).subscribe(createResult => {
        env.scorecard = JSON.parse(createResult['_body']);
        env.scorecard.Scores = [];
        this._loading.dismiss();
      });
    } else {
      // Load existing round
      let scoreCardId = this.navParams.get('incompleteScoreCardId');
      this.scorecards.findScorecard(scoreCardId).subscribe(scorecardResult => {
        if (scorecardResult) {
          this.courses.query({ 'id': scorecardResult.CourseId }).subscribe(courseResult => {
            env.course = courseResult;
            env.scorecard = {
              PlayerName: this.user.details.name,
              UserId: this.user.id,
              CourseName: courseResult.CourseName,
              CourseId: scorecardResult.CourseId,
              Scores: scorecardResult.Scores,
              IsCompleted: scorecardResult.IsCompleted,
              IsDiscarded: scorecardResult.IsDiscarded
            };
            env.scorecard['_id'] = scoreCardId;
            env.loadHoleInformation();
            env.calculateScore();
            this._loading.dismiss();
          });
        }
      });
    }
  }

  loadHoleInformation() {
    var env = this;
    env.currentScore = 0;
    env.speechNotes = '';
    env.currentPutts = 0;
    if (env.scorecard.Scores.length > 0) {
      env.scorecard.Scores.forEach(score => {
        if (score.Hole === env.currentHole) {
          env.currentScore = score.Score;
          if (score.Putts) {
            env.currentPutts = score.Putts;
          } else {
            env.currentPutts = 0;
          }
          env.holeNotes.findForUser(env.user.id, env.course._id, score.Hole).subscribe(holeNotesResult => {
            if (holeNotesResult.holenotes.length > 0) {
              env.speechNotes = holeNotesResult.holenotes[0].Note;
            }
          });
        }
      });
    }
  }

  saveHoleScore() {
    var env = this;
    let holeScore = { 'Hole': env.currentHole, 'Score': env.currentScore, 'Putts': env.currentPutts };
    let foundExistingHoleScore = false;
    if (env.scorecard.Scores.length > 0) {
      env.scorecard.Scores.forEach(score => {
        if (score.Hole === env.currentHole) {
          score.Score = env.currentScore;
          score.Putts = env.currentPutts;
          foundExistingHoleScore = true;
        }
      });
      if (!foundExistingHoleScore) {
        env.scorecard.Scores.push(holeScore);
      }
    } else {
      env.scorecard.Scores.push(holeScore);
    }
    if (env.speechNotes != '') {
      let holeNote = {
        CreatedByUserId: env.user.id,
        CourseId: env.course._id,
        HoleNumber: env.currentHole,
        CreatedByName: env.user.details.name,
        IsPublic: false,
        Note: env.speechNotes
      };
      env.holeNotes.create(holeNote).subscribe();
    }
    if (holeScore.Score <= env.course['Par_' + env.currentHole]) {
      env.showFireworks = true;
      setTimeout(function () {
        env.showFireworks = false;
      }, 5000);
    }
    env.calculateScore();
    env.updateScoreCard();
  }

  calculateScore() {
    this.runningScore = 0;
    this.runningPutts = 0;
    this.runningScoreFront9 = 0;
    this.runningScoreBack9 = 0;
    this.runningPuttsFront9 = 0;
    this.runningPuttsBack9 = 0;
    this.scorecard.Scores.forEach(holeScore => {
      let holeNumber = holeScore.Hole;
      let parNumber = this.course['Par_' + holeNumber];
      let holeTotal = 0;
      if (parNumber > holeScore.Score) {
        holeTotal = -(parNumber - holeScore.Score);
      }
      if (parNumber < holeScore.Score) {
        holeTotal = holeScore.Score - parNumber;
      }
      if (parNumber === holeScore.Score) {
        holeTotal = 0;
      }
      if (holeNumber <= 9) {
        this.runningScoreFront9 += holeTotal;
        this.runningPuttsFront9 += holeScore.Putts;
      } else {
        this.runningScoreBack9 += holeTotal;
        this.runningPuttsBack9 += holeScore.Putts;
      }
      this.runningScore += holeTotal;
      this.runningPutts += holeScore.Putts;
    });
  }

  updateScoreCard() {
    var env = this;
    env._loading = this.loadingCtrl.create();
    env._loading.present();
    env.scorecards.update(env.scorecard).subscribe(updateResult => {
      let toast = this.toastCtrl.create({
        message: 'Sweet! Your score has been saved.',
        duration: 3000
      });
      toast.present();
      env.currentScore = 1;
      if (env.currentHole < 18) {
        env.currentHole++;
      } else {
        env.currentHole = 1;
      }
      env._loading.dismiss();
      // Check to see if round is complete
      if (env.scorecard.Scores.length === 18) {
        // Round complete
        env.scoreSection = 'roundsummary';
      }
    });
  }

  stopListening() {
    this.isListening = false;
    this.speechRecognition.stopListening()
  }

  startListening() {
    var env = this;
    let options = {
      showPopup: false
    }
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (hasPermission) {
          env.isListening = true;
          env.speechNotes = 'Recording...';
          this.speechRecognition.startListening(options)
            .subscribe(
            (matches: Array<string>) => {
              env.speechNotes = matches[0];
            },
            (onerror) => console.log('error:', onerror)
            )
        } else {
          this.speechRecognition.requestPermission()
            .then(
            () => {
              env.isListening = true;
              env.speechNotes = 'Recording...';
              this.speechRecognition.startListening(options)
                .subscribe(
                (matches: Array<string>) => {
                  env.speechNotes = matches[0];
                },
                (onerror) => console.log('error:', onerror)
                )
            },
            () => console.log('Denied')
            )
        }
      });
  }

  endRound() {
    var env = this;
    env._loading = this.loadingCtrl.create();
    env._loading.present();
    env.scorecard.IsCompleted = true;
    env.scorecards.update(env.scorecard).subscribe(updateResult => {
      let toast = this.toastCtrl.create({
        message: 'Sweet! Your round has been saved.',
        duration: 3000
      });
      toast.present();
      env._loading.dismiss();
      this.navCtrl.pop();
    });
  }

  closeModal() {
    this.navCtrl.pop();
  }

}
