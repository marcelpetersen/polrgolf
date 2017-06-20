import { Component } from '@angular/core';
import { MenuController, SegmentButton, App, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { FollowersPage } from '../followers/followers';
import { SettingsPage } from '../settings/settings';
import { ProfileModel } from './profile.model';
import { ScoreCardPage } from '../score-card/score-card';
import { ProfileService } from './profile.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import { User } from '@ionic/cloud-angular';
import { ScoreCards } from '../../providers/providers';

@Component({
  selector: 'profile-page',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  display: string;
  profile: ProfileModel = new ProfileModel();
  loading: any;
  previousRounds: any;

  constructor(
    public menu: MenuController,
    public app: App,
    public navParams: NavParams,
    public profileService: ProfileService,
    public loadingCtrl: LoadingController,
    public modal: ModalController,
    public socialSharing: SocialSharing,
    public user: User,
    private scorecards: ScoreCards,
  ) {
    this.display = "grid";
  }

  ionViewDidLoad() {
    var env = this;
    var username = this.user.details.name
    if (username === null) {
      //this is a facebook login
      env.profile.user.name = env.user.social.facebook.data.full_name;
      env.profile.user.email = env.user.social.facebook.data.email;
      env.profile.user.image = env.user.social.facebook.data.profile_picture;
    } else {
      env.profile.user.name = this.user.details.name;
      env.profile.user.email = this.user.details.email;
      env.profile.user.image = this.user.details.image;
    }

    env.scorecards.query({ 'UserId': env.user.id, 'IsDiscarded': false }).subscribe(scorecardsResult => {
      env.previousRounds = scorecardsResult.scorecards.reverse();
    });

  }

  openScoreCard(scoreCardId) {
    let modal = this.modal.create(ScoreCardPage, { incompleteScoreCardId: scoreCardId });
    modal.present();
  }

  goToFollowersList() {
    // close the menu when clicking a link from the menu
    this.menu.close();
    this.app.getRootNav().push(FollowersPage, {
      list: this.profile.followers
    });
  }

  goToFollowingList() {
    // close the menu when clicking a link from the menu
    this.menu.close();
    this.app.getRootNav().push(FollowersPage, {
      list: this.profile.following
    });
  }

  goToSettings() {
    // close the menu when clicking a link from the menu
    this.menu.close();
    this.app.getRootNav().push(SettingsPage);
  }

  onSegmentChanged(segmentButton: SegmentButton) {
    // console.log('Segment changed to', segmentButton.value);
  }

  onSegmentSelected(segmentButton: SegmentButton) {
    // console.log('Segment selected', segmentButton.value);
  }

  sharePost(post) {
    //this code is to use the social sharing plugin
    // message, subject, file, url
    this.socialSharing.share(post.description, post.title, post.image)
      .then(() => {
        console.log('Success!');
      })
      .catch(() => {
        console.log('Error');
      });
  }
}
