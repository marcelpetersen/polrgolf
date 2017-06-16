import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { ScoreCard } from '../models/scorecard';
import { Api } from './api';

@Injectable()
export class ScoreCards {
    scorecard: ScoreCard[] = [];

    constructor(public http: Http, public api: Api) {
    }

    query(params?: any) {
        return this.api.get('scorecard')
            .map(resp => {
                var foundScoreCards = resp.json();
                return foundScoreCards;
            });
    }

    findScorecard(scorecardid: string) {
        return this.api.get('scorecard/' + scorecardid)
            .map(resp => {
                var foundScoreCards = resp.json();
                return foundScoreCards;
            });
    }

    findIncomplete(userid: string) {
        return this.api.get('scorecard/incomplete/' + userid)
            .map(resp => {
                var foundScoreCards = resp.json();
                return foundScoreCards;
            });
    }

    create(scorecard: any) {
        return this.api.post('scorecard', scorecard);
    }

    update(scorecard: ScoreCard) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.api.put('scorecard/' + scorecard['_id'], scorecard, options);
    }

}
