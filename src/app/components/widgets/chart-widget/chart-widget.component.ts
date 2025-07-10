import { Component, Input, Output, EventEmitter, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { BaseChartDirective } from "ng2-charts"
import type { ChartConfiguration, ChartData, ChartType } from "chart.js"

@Component({
  selector: "app-chart-widget",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="chart-container" *ngIf="chartData">
      <canvas
        baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="chartType">
      </canvas>
    </div>
    <div class="no-data" *ngIf="!chartData">
      <p>No chart data available</p>
    </div>
  `,
  styles: [
    `
    .chart-container {
      height: 100%;
      width: 100%;
      position: relative;
    }
    
    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: rgba(0, 0, 0, 0.6);
    }
  `,
  ],
})
export class ChartWidgetComponent implements OnInit, OnDestroy {
  @Input() data: any
  @Input() config: any = {}
  @Output() dataChange = new EventEmitter<any>()

  chartData: ChartData | null = null
  chartOptions: ChartConfiguration["options"] = {}
  chartType: ChartType = "line"

  ngOnInit(): void {
    this.setupChart()
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private setupChart(): void {
    if (!this.data || !this.data.series) {
      return
    }

    this.chartType = this.config.chartType || "line"

    this.chartData = {
      labels: this.data.categories || [],
      datasets: this.data.series.map((series: any, index: number) => ({
        label: series.name,
        data: series.data,
        backgroundColor: this.config.colors?.[index] || "#1976d2",
        borderColor: this.config.colors?.[index] || "#1976d2",
        fill: this.chartType === "area",
      })),
    }

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: this.config.showLegend !== false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: !!this.config.xAxisLabel,
            text: this.config.xAxisLabel,
          },
        },
        y: {
          display: true,
          title: {
            display: !!this.config.yAxisLabel,
            text: this.config.yAxisLabel,
          },
        },
      },
    }
  }
}
