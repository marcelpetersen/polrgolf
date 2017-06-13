import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Course } from '../models/course';

import { Api } from './api';

@Injectable()
export class Courses {
    courses: Course[] = [];

    constructor(public http: Http, public api: Api) {
    }

    geoQuery(params?: any) {
        return this.api.get('golfcourse/geo/' + params.long + '/' + params.lat)
            .map(resp => {
                var foundCourses = resp.json().courses;
                return foundCourses;
            });
    }

    query(params?: any) {
        return this.api.get('golfcourse/' + params.id)
            .map(resp => {
                var foundCourses = resp.json();
                return foundCourses;
            });
    }

}
