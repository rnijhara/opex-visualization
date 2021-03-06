import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-circle-packing',
  templateUrl: './circle-packing.component.html',
  styleUrls: ['./circle-packing.component.css']
})
export class CirclePackingComponent implements OnInit {
  public color: any;
  public root: any;
  private renderData: any;
  @Input()
  private width: number;
  @Input()
  private height: number;
  private svg: any;
  private format: any;
  private view: any;
  private label: any;
  private node: any;
  private focus: any;

  constructor() {
  }

  get data() {
    return this.renderData;
  }

  @Input()
  set data(value) {
    if (!value) {
      return;
    }
    if (!this.format) {
      this.initFormat();
    }
    if (!this.color) {
      this.initColor();
    }
    this.renderData = value;
    this.clearSvg();
    this.initChart();
  }

  ngOnInit() {
    this.initFormat();
    this.initColor();
  }

  public viewBox() {
    return [-this.width / 2, -this.height / 2, this.width, this.height];
  }

  private clearSvg() {
    d3.selectAll('svg > *').remove();
  }

  private initColor() {
    this.color = d3.scaleLinear()
      .domain([0, 5])
      .range(['hsl(152,80%,80%)', 'hsl(228,30%,40%)'])
      .interpolate(d3.interpolateHcl);
  }

  private initFormat() {
    this.format = d3.format(',d');
  }

  private initChart() {
    this.root = this.pack(this.renderData);
    this.focus = this.root;
    this.initSvg();
    this.initNode();
    this.initLabel();
    this.zoomTo([this.root.x, this.root.y, this.root.r * 2]);
  }

  private initSvg() {
    this.svg = d3.select('svg')
      .on('click', () => this.zoom(this.root));
  }

  private initNode() {
    this.node = this.svg.append('g')
      .selectAll('circle')
      .data(this.root.descendants().slice(1))
      .join('circle')
      .attr('fill', (d) => d.children ? this.color(d.depth) : 'white')
      .attr('pointer-events', d => !d.children ? 'none' : null)
      .on('mouseover', (d, i, n) => {
        d3.select(n[i]).attr('stroke', '#000');
      })
      .on('mouseout', (d, i, n) => {
        d3.select(n[i]).attr('stroke', null);
      })
      .on('click', d => this.focus !== d && (this.zoom(d), d3.event.stopPropagation()));
  }

  private initLabel() {
    this.label = this.svg.append('g')
      .style('font', '15px sans-serif')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(this.root.descendants())
      .join('text')
      .style('fill-opacity', d => d.parent === this.root ? 1 : 0)
      .style('display', d => d.parent === this.root ? 'inline' : 'none')
      .text(d => d.data.name);
  }

  private pack(data) {
    return d3.pack()
      .size([this.width, this.height])
      .padding(3)
      (d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));
  }

  private zoomTo(v) {
    const k = this.width / v[2];

    this.view = v;

    this.label.attr('transform', d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    this.node.attr('transform', d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    this.node.attr('r', d => d.r * k);
  }

  private zoom(zoomData) {
    this.focus = zoomData;

    const transition = this.svg.transition()
      .duration(d3.event.altKey ? 7500 : 750)
      .tween('zoom', () => {
        const i = d3.interpolateZoom(this.view, [this.focus.x, this.focus.y, this.focus.r * 2]);
        return t => this.zoomTo(i(t));
      });

    this.label
      .filter(function(d) {
        return d.parent === zoomData || this.style.display === 'inline';
      })
      .transition(transition)
      .style('fill-opacity', d => {
        return d.parent === zoomData ? 1 : 0;
      })
      .on('start', function(d) {
        if (d.parent === zoomData) {
          this.style.display = 'inline';
        }
      })
      .on('end', function(d) {
        if (d.parent !== zoomData) {
          this.style.display = 'none';
        }
      });
  }
}
