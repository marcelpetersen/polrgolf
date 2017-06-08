import { Component, ViewChild } from '@angular/core';
import { ViewController, LoadingController, Loading } from 'ionic-angular';
import { User } from '@ionic/cloud-angular';
import { GoogleMap } from "../../components/google-map/google-map";
import { GoogleMapsService } from "../maps/maps.service";
import { MapsModel } from '../maps/maps.model';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'take-picture-page',
  templateUrl: 'take-picture.html'
})

export class TakePicturePage {
  @ViewChild(GoogleMap) _GoogleMap: GoogleMap;
  map_model: MapsModel = new MapsModel();
  loading: Loading;
  mappingSessionActive: boolean;
  mappingCoords: string[];

  constructor(
    public view: ViewController,
    public GoogleMapsService: GoogleMapsService,
    public geolocation: Geolocation,
    public loadingCtrl: LoadingController,
    public user: User,
  ) {
    this.loading = this.loadingCtrl.create();
    this.loading.present();

    this._GoogleMap.$mapReady.subscribe(map => {
      this.map_model.init(map);
      this.geolocateMe();
    });
  }

  geolocateMe() {
    let env = this,
      _loading = env.loadingCtrl.create();

    _loading.present();
    this.geolocation.getCurrentPosition().then((position) => {
      console.log('Alt: ' + position.coords.altitude);
      let current_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      env.map_model.search_query = position.coords.latitude.toFixed(2) + ", " + position.coords.longitude.toFixed(2);
      env.map_model.addPlaceToMap(current_location, '#8dc63f');
      //env.setOrigin(current_location);
      env.map_model.using_geolocation = true;
      _loading.dismiss();
    }).catch((error) => {
      console.log('Error getting location', error);
      _loading.dismiss();
    });
  }

  startMapping() {
    let env = this;
    if (env.mappingSessionActive) {
      env.mappingSessionActive = false;
      console.log('Mapping stopped');
    } else {
      env.mappingSessionActive = true;
      console.log('Mapping started');
      env.engadgeMapping();
    }
  }

  engadgeMapping() {
    let env = this;
    setTimeout(function () {
      if (env.mappingSessionActive) {
        env.geolocation.getCurrentPosition().then((position) => {
          //env.mappingAlts.push(position.coords.altitude);
          console.log('Alt: ' + position.coords.altitude);
          env.engadgeMapping();
        });
      }
    }, 2000);
  }

  setOrigin(location: google.maps.LatLng) {
    let env = this;
    env.map_model.cleanMap();
    env.map_model.directions_origin.location = location;
    env.map_model.addPlaceToMap(location, '#8dc63f');
    // env.courses.geoQuery({ long: location.lng(), lat: location.lat() }).subscribe(
    //   courses => {

    //     if (courses.length > 0) {

    //       let bound = new google.maps.LatLngBounds();
    //       for (var i = 0; i < courses.length; i++) {
    //         bound.extend(new google.maps.LatLng(courses[i].location.coordinates[1], courses[i].location.coordinates[0]));
    //         env.map_model.addNearbyPlace(courses[i]);
    //       }

    //       env.choosePlace(env.map_model.nearby_places[0]);
    //       env.map_model.map.fitBounds(bound);
    //       this._loading.dismiss();

    //     } else {
    //       env._loading.dismiss();
    //       let toast = env.toastCtrl.create({
    //         message: 'No courses found in this area.',
    //         duration: 3000
    //       });
    //       toast.present();
    //     }

    //   },
    //   e => {
    //     env._loading.dismiss();
    //     let toast = env.toastCtrl.create({
    //       message: 'Error loading map.',
    //       duration: 3000
    //     });
    //     toast.present();
    //     console.log('onError: %s', e);
    //   },
    //   () => {
    //     env._loading.dismiss();
    //     console.log('onCompleted');
    //   });

  }

  dismiss() {
    this.view.dismiss();
  }
}
