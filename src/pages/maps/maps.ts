import { Component, ViewChild, OnInit, Renderer } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
import { ScoreCards } from '../../providers/providers';
import { Auth, User } from '@ionic/cloud-angular';
import { ScoreCardPage } from '../score-card/score-card';
import { Observable } from 'rxjs/Observable';
import { GoogleMap } from "../../components/google-map/google-map";
import { GoogleMapsService } from "./maps.service";
import { MapsModel } from './maps.model';
import { Courses } from '../../providers/providers';
import { ContactCardPage } from '../contact-card/contact-card';
import { CallNumber } from '@ionic-native/call-number';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { PlayRoundPage } from '../play-round/play-round';

@Component({
  selector: 'maps-page',
  templateUrl: 'maps.html'
})

export class MapsPage implements OnInit {
  @ViewChild(GoogleMap) _GoogleMap: GoogleMap;
  map_model: MapsModel = new MapsModel();
  currentDistanceText: string;
  _loading: any;
  selectedPlaceImage: string;
  selectedPlace: any = {};
  displayPlaceDetails: boolean = false;
  indrag = false;

  constructor(
    public nav: NavController,
    private launchNavigator: LaunchNavigator,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public GoogleMapsService: GoogleMapsService,
    public geolocation: Geolocation,
    public keyboard: Keyboard,
    private scorecards: ScoreCards,
    public callNumber: CallNumber,
    public modal: ModalController,
    public alertCtrl: AlertController,
    public auth: Auth,
    public user: User,
    public courses: Courses,
    public renderer: Renderer
  ) {
  }

  ngOnInit() {
    this._loading = this.loadingCtrl.create();
    this._loading.present();

    this.checkForOpenRound();
    this._GoogleMap.$mapReady.subscribe(map => {
      this.map_model.init(map);
      map.panBy(0, 800);
      this.geolocateMe();
      this.selectedPlaceImage = 'assets/images/splash.png';
    });

  }

  startRound() {
    console.log('Launch clicked');
    this.navCtrl.push(PlayRoundPage, { course: this.selectedPlace });
  }

  launchMaps() {
    this.geolocation.getCurrentPosition().then((position) => {
      let options: LaunchNavigatorOptions = {
        start: position.coords.latitude + ',' + position.coords.longitude
      };
      let location = this.selectedPlace.StreetAddress + ' ' + this.selectedPlace.City + ' ' + this.selectedPlace.StateorRegion + ' ' + this.selectedPlace.Zip;
      this.launchNavigator.navigate(location, options)
        .then(
        success => console.log('Launched navigator'),
        error => console.log('Error launching navigator', error)
        );
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  ionViewDidEnter() {
    // Use ngOnInit instead
  }

  searchPlacesPredictions(query: string) {
    let env = this;

    if (query !== "") {
      env.GoogleMapsService.getPlacePredictions(query).subscribe(
        places_predictions => {
          env.map_model.search_places_predictions = places_predictions;
        },
        e => {
          console.log('onError: %s', e);
        },
        () => {
          console.log('onCompleted');
        }
      );
    } else {
      env.map_model.search_places_predictions = [];
    }
  }

  setOrigin(location: google.maps.LatLng) {
    let env = this;
    env.map_model.cleanMap();
    env.map_model.directions_origin.location = location;
    env.map_model.addPlaceToMap(location, '#8dc63f');
    env.courses.geoQuery({ long: location.lng(), lat: location.lat() }).subscribe(
      courses => {

        if (courses.length > 0) {

          let bound = new google.maps.LatLngBounds();
          for (var i = 0; i < courses.length; i++) {
            if (courses[i].Location !== undefined) {
              bound.extend(new google.maps.LatLng(courses[i].Location.coordinates[1], courses[i].Location.coordinates[0]));
              env.map_model.addNearbyPlace(courses[i]);
            }
          }

          //env.choosePlace(env.map_model.nearby_places[0]);
          env.map_model.map.fitBounds(bound);

        } else {
          let toast = env.toastCtrl.create({
            message: 'No courses found in this area.',
            duration: 3000
          });
          toast.present();
        }

      },
      e => {
        let toast = env.toastCtrl.create({
          message: 'Error loading map.',
          duration: 3000
        });
        toast.present();
        console.log('onError: %s', e);
      },
      () => {
        console.log('onCompleted');
      });

  }

  selectSearchResult(place) {
    let env = this;

    env.map_model.search_query = place.description;
    env.map_model.search_places_predictions = [];
    env.GoogleMapsService.geocodePlace(place.place_id).subscribe(
      place_location => {
        env.setOrigin(place_location);
      },
      e => {
        console.log('onError: %s', e);
      },
      () => {
        console.log('onCompleted');
      }
    );
  }

  openCourse(course) {
    this.nav.push(ContactCardPage, { course: course });
  }

  clearSearch() {
    let env = this;
    this.keyboard.close();
    // Clean map
    env.map_model.cleanMap();
  }

  geolocateMe() {
    let env = this;
    this.geolocation.getCurrentPosition().then((position) => {
      let current_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      env.map_model.search_query = position.coords.latitude.toFixed(2) + ", " + position.coords.longitude.toFixed(2);
      env.setOrigin(current_location);
      env.map_model.using_geolocation = true;
      env._loading.dismiss();
    }).catch((error) => {
      console.log('Error getting location', error);
      env._loading.dismiss();
    });
  }



  choosePlace(place) {
    let env = this;
    this._loading = this.loadingCtrl.create();
    //this._loading.present();
    this.displayPlaceDetails = false;

    // Check if the place is not already selected
    if (place) {
      // De-select previous places
      env.map_model.deselectPlaces();
      // Select current place
      place.select();

      // Get both route directions and distance between the two locations
      let directions_observable = env.GoogleMapsService
        .getDirections(env.map_model.directions_origin.location, place.location),
        distance_observable = env.GoogleMapsService
          .getDistanceMatrix(env.map_model.directions_origin.location, place.location);

      Observable.forkJoin(directions_observable, distance_observable).subscribe(
        data => {
          let directions = data[0],
            distance = data[1].rows[0].elements[0].distance.text,
            duration = data[1].rows[0].elements[0].duration.text;
          env.map_model.directions_display.setDirections(directions);
          env.currentDistanceText = distance + ' away and will take ' + duration;
          place.details.distanceText = distance + ' away and will take ' + duration;
          env.selectedPlaceImage = place.details.image;
          env.selectedPlace = place.details;
          env.displayPlaceDetails = true;
        },
        e => {
          console.log('onError: %s', e);
        },
        () => {
          env._loading.dismiss();
          console.log('onCompleted');
        }
      );
    }
  }

  touchEnd($e) {
    console.log('Touch end');
    this.renderer.setElementStyle($e.target, 'bottom', '10px');
    this.renderer.setElementStyle($e.target, 'opacity', '1');
    this.indrag = false;
  }

  swipeEvent($e, place, index) {

    var env = this;
    console.log('Dir: ' + $e.direction);
    console.log('DeltaY: ' + $e.deltaY)
    if ($e.direction === 8) {
      env.indrag = true;
      if ($e.target.className === 'place-card card card-md' || $e.target.className === 'place-card card card-ios') {
        if (index < 3) {
          this.renderer.setElementStyle($e.target, 'opacity', '1');
        }
        this.renderer.setElementStyle($e.target, 'top', $e.deltaY + 'px');
        if ($e.deltaY < -100) {
          this.renderer.setElementStyle($e.target, 'opacity', '.7');
        }
        if ($e.deltaY < -150) {
          this.renderer.setElementStyle($e.target, 'opacity', '.5');
        }
        if ($e.deltaY < -200) {
          this.renderer.setElementStyle($e.target, 'opacity', '.2');
        }
        if ($e.deltaY < -250) {
          if (env.selectedPlace.CourseName !== place.CourseName || env.selectedPlace.CourseName === undefined) {
            this.renderer.setElementStyle($e.target, 'display', 'none');
            env.choosePlace(place);
          }
        }
      }
    }

  }

  checkForOpenRound() {
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
                    let toast = env.toastCtrl.create({
                      message: 'Your round has been discarded.',
                      duration: 3000
                    });
                    toast.present();
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

  call(number: string) {
    this.callNumber.callNumber(number, true)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'));
  }

}
