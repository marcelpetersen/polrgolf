import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { ScoreCards } from '../../providers/providers';
import { Courses } from '../../providers/providers';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { User } from '@ionic/cloud-angular';

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
  runningScore: number = 0;
  runningScoreFront9: number = 0;
  runningScoreBack9: number = 0;

  constructor(
    private navCtrl: NavController,
    public inAppBrowser: InAppBrowser,
    public user: User,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private scorecards: ScoreCards,
    public courses: Courses,
  ) {
    this._loading = this.loadingCtrl.create();
    this._loading.present();
    var env = this;
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
              IsCompleted: false,
              IsDiscarded: false
            };
            env.scorecard['_id'] = scoreCardId;
            scorecardResult.Scores.forEach(score => {
              env.calculateScore({ 'Hole': score.Hole, 'Score': score.Score });
            });
            env.checkHoleInformation();
            this._loading.dismiss();
          });
        }
      });
    }
  }

  checkHoleInformation() {
    var env = this;
    env.currentScore = 0;
    if (env.scorecard.Scores.length > 0) {
      env.scorecard.Scores.forEach(score => {
        if (score.Hole === env.currentHole) {
          env.currentScore = score.Score;
        }
      });
    }
  }

  saveHoleScore() {
    var env = this;
    let holeScore = { 'Hole': env.currentHole, 'Score': env.currentScore };
    let foundExistingHoleScore = false;
    if (env.scorecard.Scores.length > 0) {
      env.scorecard.Scores.forEach(score => {
        if (score.Hole === env.currentHole) {
          score.Score = env.currentScore;
          foundExistingHoleScore = true;
        }
      });
      if (!foundExistingHoleScore) {
        env.scorecard.Scores.push(holeScore);
      }
    } else {
      env.scorecard.Scores.push(holeScore);
    }
    env.calculateScore(holeScore);
    env.updateScoreCard();
  }

  calculateScore(holeScore) {
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
    } else {
      this.runningScoreBack9 += holeTotal;
    }
    this.runningScore += holeTotal;
  }

  updateScoreCard() {
    var env = this;
    env._loading = this.loadingCtrl.create();
    env._loading.present();
    env.scorecards.update(env.scorecard).subscribe(updateResult => {
      env.currentScore = 1;
      if (env.currentHole < 18) {
        env.currentHole++;
      } else {
        env.currentHole = 1;
      }
      env._loading.dismiss();
      // Check to see if round is complete
      if (env.scorecard.Scores.length === 18) {
        alert('Is your round complete?');
      }
    });
  }

}
