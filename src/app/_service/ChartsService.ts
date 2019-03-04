import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  private readonly chartsEndpoint = '/charts';
  private readonly endpoint = 'http://localhost:9000';

  constructor(private http: HttpClient) {
  }

  getChart(chartType: string): Observable<any> {
    return this.http.get<any>(`${this.endpoint}${this.chartsEndpoint}/${chartType}`);
  }
}
