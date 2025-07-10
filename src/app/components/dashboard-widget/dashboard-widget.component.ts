import { Component, Input, Output, EventEmitter, type OnInit, type OnDestroy, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatMenuModule } from "@angular/material/menu"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { MatTooltipModule } from "@angular/material/tooltip"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"

import type { Widget } from "../../models/dashboard.model"
import { DataSourceService } from "../../services/data-source.service"

// Import widget components
import { ChartWidgetComponent } from "../widgets/chart-widget/chart-widget.component"
import { StatsWidgetComponent } from "../widgets/stats-widget/stats-widget.component"
import { TableWidgetComponent } from "../widgets/table-widget/table-widget.component"
import { TextWidgetComponent } from "../widgets/text-widget/text-widget.component"

@Component({
  selector: "app-dashboard-widget",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ChartWidgetComponent,
    StatsWidgetComponent,
    TableWidgetComponent,
    TextWidgetComponent,
  ],
  templateUrl: "./dashboard-widget.component.html",
  styleUrls: ["./dashboard-widget.component.scss"],
})
export class DashboardWidgetComponent implements OnInit, OnDestroy {
  private dataSourceService = inject(DataSourceService)

  @Input() widget!: Widget
  @Input() editable = false

  @Output() editWidget = new EventEmitter<Widget>()
  @Output() removeWidget = new EventEmitter<string>()
  @Output() duplicateWidget = new EventEmitter<Widget>()
  @Output() updateWidget = new EventEmitter<Widget>()

  isLoading = false
  error: string | null = null
  widgetData: any = null

  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    this.loadWidgetData()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadWidgetData(): void {
    if (!this.widget.dataSource) {
      return
    }

    this.isLoading = true
    this.error = null

    this.dataSourceService
      .fetchData(this.widget.dataSource)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.widgetData = data
          this.isLoading = false

          if (data && data.error) {
            this.error = data.error
          }
        },
        error: (err) => {
          this.error = `Error loading widget data: ${err.message || "Unknown error"}`
          this.isLoading = false
        },
      })
  }

  onEdit(): void {
    this.editWidget.emit(this.widget)
  }

  onRemove(): void {
    this.removeWidget.emit(this.widget.id)
  }

  onDuplicate(): void {
    this.duplicateWidget.emit(this.widget)
  }

  onRefresh(): void {
    this.loadWidgetData()
  }

  onDataUpdate(data: any): void {
    const updatedWidget = { ...this.widget }
    updatedWidget.dataSource.data = data
    this.updateWidget.emit(updatedWidget)
  }
}
