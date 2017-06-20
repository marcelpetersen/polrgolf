import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { HoleNote } from '../models/holenote';
import { Api } from './api';


@Injectable()
export class HoleNotes {
    holenote: HoleNote[] = [];

    constructor(public http: Http, public api: Api) {
    }

    query(params?: any) {
        return this.api.get('holenote')
            .map(resp => {
                var foundScoreCards = resp.json();
                return foundScoreCards;
            });
    }

    findHoleNote(holenoteid: string) {
        return this.api.get('holenote/' + holenoteid)
            .map(resp => {
                var foundHoleNotes = resp.json();
                return foundHoleNotes;
            });
    }

    findForUser(userid: string, courseid: string, holenumber: number) {
        return this.api.get('holenote/foruser/' + userid + '/' + courseid + '/' + holenumber)
            .map(resp => {
                var foundHoleNotes = resp.json();
                return foundHoleNotes;
            });
    }

    create(holenote: any) {
        return this.api.post('holenote', holenote);
    }

    update(holenote: HoleNote) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.api.put('holenote/' + holenote['_id'], holenote, options);
    }

}
