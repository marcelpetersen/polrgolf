import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms';

import { TermsOfServicePage } from '../terms-of-service/terms-of-service';
import { WalkthroughPage } from '../walkthrough/walkthrough';

import 'rxjs/Rx';

import { ProfileModel } from '../profile/profile.model';
import { ProfileService } from '../profile/profile.service';
import { Auth, User } from '@ionic/cloud-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Transfer, TransferObject } from '@ionic-native/transfer';

@Component({
  selector: 'settings-page',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  settingsForm: FormGroup;
  // make WalkthroughPage the root (or first) page
  rootPage: any = WalkthroughPage;
  loading: any;
  profile: ProfileModel = new ProfileModel();

  constructor(
    public nav: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public profileService: ProfileService,
    public auth: Auth,
    public user: User,
    private camera: Camera,
    private transfer: Transfer,
    public toastCtrl: ToastController
  ) {
    this.loading = this.loadingCtrl.create();

    this.settingsForm = new FormGroup({
      name: new FormControl(),
      notifications: new FormControl()
    });

  }

  ionViewDidLoad() {
    this.loading.present();
    let env = this;
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
    this.loading.dismiss();
  }

  saveForm() {
    this.user.details.name = this.settingsForm.value.name;
    this.user.save().then(() => {
      let toast = this.toastCtrl.create({
        message: 'Your settings have been saved.',
        duration: 3000
      });
      toast.present();
    });
  }

  logout() {
    // navigate to the new page if it is not the current page
    this.auth.logout();
    this.nav.setRoot(this.rootPage);
  }

  showTermsModal() {
    let modal = this.modal.create(TermsOfServicePage);
    modal.present();
  }

  gotoStartPage() {
    this.nav.setRoot(WalkthroughPage);
  }

  showTakePicture() {

    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      cameraDirection: this.camera.Direction.FRONT
    }

    this.camera.getPicture(options).then((imageData) => {

      this.loading = this.loadingCtrl.create({
        content: 'Crunching pixels...',
      });
      this.loading.present();

      let picture = 'data:image/jpeg;base64,' + imageData;
      var url = "https://api.cloudinary.com/v1_1/zendoks/upload";

      var options = {
        fileKey: "file",
        fileName: 'temp.jpg',
        chunkedMode: false,
        mimeType: "multipart/form-data",
        params: { 'fileName': 'tmp.jpg', 'upload_preset': 'oc7xe4iz' }
      };

      const fileTransfer: TransferObject = this.transfer.create();
      fileTransfer.upload(picture, url, options).then(data => {
        this.user.details.image = JSON.parse(data.response).url;
        this.user.save().then(() => {
          this.profile.user.image = this.user.details.image;
          this.loading.dismissAll();
        });
      });

    }, (err) => {
      // Handle error
    });

  }
}
