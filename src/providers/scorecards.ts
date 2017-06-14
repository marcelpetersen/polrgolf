import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { ScoreCard } from '../models/scorecard';
import { Api } from './api';

@Injectable()
export class ScoreCards {
    scorecard: ScoreCard[] = [];

    constructor(public http: Http, public api: Api) {
    }

    query(params?: any) {
        return this.api.get('scorecard/' + params.id)
            .map(resp => {
                var foundScoreCards = resp.json();
                return foundScoreCards;
            });
    }

}
