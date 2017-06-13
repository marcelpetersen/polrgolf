import { Component, ViewChild, OnInit, Renderer } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';

import { Observable } from 'rxjs/Observable';

import { GoogleMap } from "../../components/google-map/google-map";
import { GoogleMapsService } from "./maps.service";
import { MapsModel } from './maps.model';
import { Courses } from '../../providers/providers';
import { ContactCardPage } from '../contact-card/contact-card';

@Component({
  selector: 'maps-page',
  templateUrl: 'maps.html'
})

export class MapsPage implements OnInit {
  @ViewChild(GoogleMap) _GoogleMap: GoogleMap;
  map_model: MapsModel = new MapsModel();
  currentDistanceText: string;
  _loading: any;

  constructor(
    public nav: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public GoogleMapsService: GoogleMapsService,
    public geolocation: Geolocation,
    public keyboard: Keyboard,
    public courses: Courses,
    public renderer: Renderer
  ) {
  }

  swipeEvent($e) {
    // swipe up $e.direction = 8;

    console.log($e.direction);
    // pan for get fired position
    console.log($e.deltaX + ", " + $e.deltaY);
    this.renderer.setElementStyle($e.target, 'top', $e.deltaY + 'px')

  }

  ngOnInit() {
    this._loading = this.loadingCtrl.create();
    this._loading.present();

    this._GoogleMap.$mapReady.subscribe(map => {
      this.map_model.init(map);
      this.geolocateMe();
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

        console.log(JSON.stringify(courses));

        if (courses.length > 0) {

          let bound = new google.maps.LatLngBounds();
          for (var i = 0; i < courses.length; i++) {
            if (courses[i].Location !== undefined) {
              bound.extend(new google.maps.LatLng(courses[i].Location.coordinates[1], courses[i].Location.coordinates[0]));
              env.map_model.addNearbyPlace(courses[i]);
            }
          }

          env.choosePlace(env.map_model.nearby_places[0]);
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
    this._loading.present();

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
          env.currentDistanceText = 'That\'s ' + distance + ' away and will take ' + duration;
          place.details.distanceText = 'That\'s ' + distance + ' away and will take ' + duration;
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
}
