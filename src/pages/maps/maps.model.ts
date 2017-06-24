export class MapsModel {
	map: google.maps.Map;
	map_options: google.maps.MapOptions = {
		center: { lat: 40.785091, lng: -73.968285 },
		zoom: 13,
		disableDefaultUI: true
	};

	map_places: Array<MapPlace> = [];

	search_query: string = '';
	search_places_predictions: Array<google.maps.places.AutocompletePrediction> = [];

	nearby_places: Array<MapPlace> = [];

	directions_origin: MapPlace = new MapPlace();
	directions_display: google.maps.DirectionsRenderer;

	using_geolocation: boolean = false;

	// https://developers.google.com/maps/documentation/javascript/reference#Map
	init(map: google.maps.Map) {
		this.map = map;
		// https://developers.google.com/maps/documentation/javascript/reference#DirectionsRenderer
		this.directions_display = new google.maps.DirectionsRenderer({
			map: this.map,
			suppressMarkers: true,
			preserveViewport: true
		});

		this.map.setOptions(
			{
				styles: [
					{
						"featureType": "all",
						"elementType": "labels.text.fill",
						"stylers": [
							{
								"saturation": 36
							},
							{
								"color": "#000000"
							},
							{
								"lightness": 40
							}
						]
					},
					{
						"featureType": "all",
						"elementType": "labels.text.stroke",
						"stylers": [
							{
								"visibility": "on"
							},
							{
								"color": "#000000"
							},
							{
								"lightness": 16
							}
						]
					},
					{
						"featureType": "all",
						"elementType": "labels.icon",
						"stylers": [
							{
								"visibility": "off"
							}
						]
					},
					{
						"featureType": "administrative",
						"elementType": "geometry.fill",
						"stylers": [
							{
								"color": "#000000"
							},
							{
								"lightness": 20
							}
						]
					},
					{
						"featureType": "administrative",
						"elementType": "geometry.stroke",
						"stylers": [
							{
								"color": "#000000"
							},
							{
								"lightness": 17
							},
							{
								"weight": 1.2
							}
						]
					},
					{
						"featureType": "landscape",
						"elementType": "geometry",
						"stylers": [
							{
								"color": "#000000"
							},
							{
								"lightness": 20
							}
						]
					},
					{
						"featureType": "poi",
						"elementType": "geometry",
						"stylers": [
							{
								"color": "#000000"
							},
							{
								"lightness": 21
							}
						]
					},
					{
						"featureType": "road.highway",
						"elementType": "geometry.fill",
						"stylers": [
							{
								"color": "#000000"
							},
							{
								"lightness": 17
							}
						]
					},
					{
						"featureType": "road.highway",
						"elementType": "geometry.stroke",
						"stylers": [
							{
								"color": "#000000"
							},
							{
								"lightness": 29
							},
							{
								"weight": 0.2
							}
						]
					},
					{
						"featureType": "road.arterial",
						"elementType": "geometry",
						"stylers": [
							{
								"color": "#000000"
							},
							{
								"lightness": 18
							}
						]
					},
					{
						"featureType": "road.local",
						"elementType": "geometry",
						"stylers": [
							{
								"color": "#000000"
							},
							{
								"lightness": 16
							}
						]
					},
					{
						"featureType": "transit",
						"elementType": "geometry",
						"stylers": [
							{
								"color": "#000000"
							},
							{
								"lightness": 19
							}
						]
					},
					{
						"featureType": "water",
						"elementType": "geometry",
						"stylers": [
							{
								"color": "#000000"
							},
							{
								"lightness": 17
							}
						]
					}
				]
			}
		);
	}

	cleanMap() {
		// Empty nearby places array
		this.nearby_places = [];

		// To clear previous directions
		this.directions_display.setDirections({ routes: [] });

		// To remove all previous markers from the map
		this.map_places.forEach((place) => {
			place.marker.setMap(null);
		});

		// Empty markers array
		this.map_places = [];

		this.using_geolocation = false;
	}

	addPlaceToMap(location: google.maps.LatLng, color: string = '#333333'): MapPlace {
		let _map_place = new MapPlace();

		_map_place.location = location;
		_map_place.marker = new google.maps.Marker({
			position: location,
			map: this.map,
			icon: '../assets/images/marker.png'
		});

		this.map_places.push(_map_place);

		return _map_place;
	}

	addNearbyPlace(place_result) {
		let _map_place = this.addPlaceToMap(new google.maps.LatLng(place_result.Location.coordinates[1], place_result.Location.coordinates[0]), '#666666');
		_map_place.details = place_result;
		if (place_result.DefaultImage !== undefined) {
			_map_place.details["image"] = place_result.DefaultImage;
		} else {
			_map_place.details["image"] = 'http://res.cloudinary.com/zendoks/image/upload/v1496289734/courses/pexels-photo-28276.jpg';
		}

		this.nearby_places.push(_map_place);
	}

	deselectPlaces() {
		this.nearby_places.forEach((place) => {
			place.deselect();
		});
	}
}

export class MapPlace {
	marker: google.maps.Marker;
	location: google.maps.LatLng;
	selected: boolean = false;
	// This is an extra attribute for nearby places only
	details: google.maps.places.PlaceResult;

	// https://developers.google.com/maps/documentation/javascript/reference#Symbol
	static createIcon(color: string): google.maps.Symbol {
		let _icon: google.maps.Symbol = {
			path: "M144 400c80 0 144 -60 144 -134c0 -104 -144 -282 -144 -282s-144 178 -144 282c0 74 64 134 144 134zM144 209c26 0 47 21 47 47s-21 47 -47 47s-47 -21 -47 -47s21 -47 47 -47z",
			fillColor: color,
			fillOpacity: .6,
			anchor: new google.maps.Point(0, 0),
			strokeWeight: 0,
			scale: 0.08,
			rotation: 180
		}
		return _icon;
	}

	setIcon(color: string): void {
		this.marker.setIcon(MapPlace.createIcon(color));
	}

	deselect() {
		this.selected = false;
		this.setIcon('#666666');
	}

	select() {
		this.selected = true;
		this.setIcon('#8dc63f');
	}
}
