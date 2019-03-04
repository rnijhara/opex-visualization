import { Component, OnInit } from '@angular/core';
import { ChartsService } from './_service/ChartsService';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private chartType = 'circle_packing';
  private readonly width: number;
  private readonly height: number;
  private data: any;

  constructor(private chartsService: ChartsService) {
    this.width = 932;
    this.height = 932;
  }

  ngOnInit() {
    this.chartsService.getChart(this.chartType)
      .pipe(
        tap(data => {
          this.data = data;
        })
      ).subscribe();
  }
}
