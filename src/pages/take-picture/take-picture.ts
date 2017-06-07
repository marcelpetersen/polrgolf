import { Component } from '@angular/core';
import { ViewController, LoadingController, Loading } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { Transfer, TransferObject } from '@ionic-native/transfer';
import { User } from '@ionic/cloud-angular';

@Component({
  selector: 'take-picture-page',
  templateUrl: 'take-picture.html'
})

export class TakePicturePage {

  loading: Loading;

  constructor(
    public view: ViewController,
    private camera: Camera,
    private transfer: Transfer,
    public loadingCtrl: LoadingController,
    public user: User,
  ) {
    // const cameraPreviewOpts: CameraPreviewOptions = {
    //   x: 0,
    //   y: 65,
    //   width: window.screen.width,
    //   height: window.screen.height,
    //   camera: 'front',
    //   tapPhoto: true,
    //   previewDrag: false,
    //   toBack: false
    // };

    // this.cameraPreview.startCamera(cameraPreviewOpts).then(
    //   (res) => {
    //     console.log(res)
    //   },
    //   (err) => {
    //     console.log(err)
    //   });
  }

  takePicture() {

    this.loading = this.loadingCtrl.create({
      content: 'Saving...',
    });
    this.loading.present();

    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {


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
          this.loading.dismissAll();
          this.view.dismiss();
        });
      });


    }, (err) => {
      // Handle error
    });


    // const pictureOpts: CameraPreviewPictureOptions = {
    //   width: 300,
    //   height: 300,
    //   quality: 100
    // }

    // this.cameraPreview.takePicture(pictureOpts).then((imageData) => {

    //   let picture = 'data:image/jpeg;base64,' + imageData;
    //   this.cameraPreview.hide();
    //   this.cameraPreview.stopCamera();

    //   var url = "https://api.cloudinary.com/v1_1/zendoks/upload";

    //   var options = {
    //     fileKey: "file",
    //     fileName: 'temp.jpg',
    //     chunkedMode: false,
    //     mimeType: "multipart/form-data",
    //     params: { 'fileName': 'tmp.jpg', 'upload_preset': 'oc7xe4iz' }
    //   };

    //   const fileTransfer: TransferObject = this.transfer.create();
    //   fileTransfer.upload(picture, url, options).then(data => {
    //     this.user.details.image = JSON.parse(data.response).url;
    //     this.user.save().then(() => {
    //       this.loading.dismissAll();
    //       this.view.dismiss();
    //     });
    //   });

    // });

  }

  dismiss() {
    this.view.dismiss();
  }
}
