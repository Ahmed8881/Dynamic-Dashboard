import {
  Component,
  type OnInit,
  type OnDestroy,
  ViewChild,
  type ElementRef,
  ChangeDetectorRef,
  inject,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatSidenavModule } from "@angular/material/sidenav"
import { MatCardModule } from "@angular/material/card"
import { MatMenuModule } from "@angular/material/menu"
import { MatDialogModule, MatDialog } from "@angular/material/dialog"
import { MatTooltipModule } from "@angular/material/tooltip"
import { MatDividerModule } from "@angular/material/divider"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import { DragDropModule, type CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop"
import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"

import { DashboardService } from "../../services/dashboard.service"
import { WidgetRegistryService } from "../../services/widget-registry.service"
import { DataSourceService } from "../../services/data-source.service"
import type { DashboardConfig, Widget, WidgetTemplate } from "../../models/dashboard.model"

import { DashboardWidgetComponent } from "../dashboard-widget/dashboard-widget.component"
import { AddWidgetDialogComponent } from "../dialogs/add-widget-dialog/add-widget-dialog.component"
import { DashboardSettingsDialogComponent } from "../dialogs/dashboard-settings-dialog/dashboard-settings-dialog.component"
import { ConfirmDialogComponent } from "../dialogs/confirm-dialog/confirm-dialog.component"

@Component({
  selector: "app-dynamic-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    DragDropModule,
    DashboardWidgetComponent,
  ],
  templateUrl: "./dynamic-dashboard.component.html",
  styleUrls: ["./dynamic-dashboard.component.scss"],
})
export class DynamicDashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService)
  private widgetRegistry = inject(WidgetRegistryService)
  private dataSourceService = inject(DataSourceService)
  private dialog = inject(MatDialog)
  private cdr = inject(ChangeDetectorRef)

  @ViewChild("gridContainer", { static: false }) gridContainer!: ElementRef

  dashboardConfig: DashboardConfig | null = null
  availableDashboards: DashboardConfig[] = []
  widgetTemplates: WidgetTemplate[] = []

  isEditMode = false
  isLoading = true
  showWidgetPalette = false

  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    this.loadDashboards()
    this.widgetTemplates = this.widgetRegistry.getWidgetTemplates()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadDashboards(): void {
    this.dashboardService
      .getDashboards()
      .pipe(takeUntil(this.destroy$))
      .subscribe((dashboards) => {
        this.availableDashboards = dashboards
        this.isLoading = false
      })

    this.dashboardService
      .getCurrentDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe((dashboard) => {
        this.dashboardConfig = dashboard
        this.cdr.detectChanges()
      })
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode
    if (!this.isEditMode) {
      this.showWidgetPalette = false
    }
  }

  toggleWidgetPalette(): void {
    this.showWidgetPalette = !this.showWidgetPalette
  }

  openAddWidgetDialog(): void {
    if (!this.dashboardConfig) return

    const dialogRef = this.dialog.open(AddWidgetDialogComponent, {
      width: "800px",
      maxHeight: "90vh",
      data: {
        templates: this.widgetTemplates,
        dataSourceService: this.dataSourceService,
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.dashboardConfig) {
        this.addWidget(result.type, result.config, result.dataSource)
      }
    })
  }

  addWidget(widgetType: string, customConfig: any = {}, dataSource: any = null): void {
    if (!this.dashboardConfig) return

    const template = this.widgetTemplates.find((t) => t.type === widgetType)
    if (!template) return

    const position = this.findOptimalPosition(
      customConfig.size?.width || template.defaultSize.width,
      customConfig.size?.height || template.defaultSize.height,
    )

    const newWidget: Widget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: widgetType,
      title: customConfig.title || template.name,
      description: customConfig.description || template.description,
      position,
      size: customConfig.size || template.defaultSize,
      config: { ...template.defaultConfig, ...customConfig },
      dataSource: dataSource || this.createDefaultDataSource(widgetType),
      refreshInterval: customConfig.refreshInterval || 0,
    }

    this.dashboardService.addWidget(this.dashboardConfig.id, newWidget)
  }

  editWidget(widget: Widget): void {
    // Implementation for edit widget dialog
    console.log("Edit widget:", widget)
  }

  updateWidget(widget: Widget): void {
    if (!this.dashboardConfig) return
    this.dashboardService.updateWidget(this.dashboardConfig.id, widget)
  }

  removeWidget(widgetId: string): void {
    if (!this.dashboardConfig) return

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Remove Widget",
        message: "Are you sure you want to remove this widget?",
        confirmText: "Remove",
        cancelText: "Cancel",
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.dashboardConfig) {
        this.dashboardService.removeWidget(this.dashboardConfig.id, widgetId)
      }
    })
  }

  duplicateWidget(widget: Widget): void {
    if (!this.dashboardConfig) return

    const position = this.findOptimalPosition(widget.size.width, widget.size.height)

    const duplicatedWidget: Widget = {
      ...JSON.parse(JSON.stringify(widget)),
      id: `widget_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title: `${widget.title} (Copy)`,
      position,
    }

    this.dashboardService.addWidget(this.dashboardConfig.id, duplicatedWidget)
  }

  onDrop(event: CdkDragDrop<Widget[]>): void {
    if (!this.dashboardConfig) return

    if (event.previousContainer === event.container) {
      moveItemInArray(this.dashboardConfig.widgets, event.previousIndex, event.currentIndex)
      this.dashboardService.updateDashboard(this.dashboardConfig)
    } else {
      const widgetType = event.item.data
      this.addWidget(widgetType)
    }
  }

  createNewDashboard(): void {
    const dialogRef = this.dialog.open(DashboardSettingsDialogComponent, {
      width: "600px",
      data: {
        isNew: true,
        dashboard: {
          title: "New Dashboard",
          description: "",
          layout: "grid",
          theme: "light",
        },
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dashboardService.createDashboard(result)
      }
    })
  }

  switchDashboard(dashboardId: string): void {
    this.dashboardService.setCurrentDashboard(dashboardId)
  }

  deleteDashboard(): void {
    if (!this.dashboardConfig) return

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "400px",
      data: {
        title: "Delete Dashboard",
        message: `Are you sure you want to delete "${this.dashboardConfig.title}"?`,
        confirmText: "Delete",
        cancelText: "Cancel",
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.dashboardConfig) {
        this.dashboardService.deleteDashboard(this.dashboardConfig.id)
      }
    })
  }

  getGridColumn(widget: Widget): string {
    return `${widget.position.x + 1} / span ${widget.size.width}`
  }

  getGridRow(widget: Widget): string {
    return `${widget.position.y + 1} / span ${widget.size.height}`
  }

  trackByWidgetId(index: number, widget: Widget): string {
    return widget.id
  }

  private findOptimalPosition(width: number, height: number): { x: number; y: number } {
    if (!this.dashboardConfig) return { x: 0, y: 0 }

    const gridColumns = 12
    const occupied = new Set<string>()

    this.dashboardConfig.widgets.forEach((widget) => {
      for (let x = widget.position.x; x < widget.position.x + widget.size.width; x++) {
        for (let y = widget.position.y; y < widget.position.y + widget.size.height; y++) {
          occupied.add(`${x},${y}`)
        }
      }
    })

    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= gridColumns - width; x++) {
        let canPlace = true

        for (let dx = 0; dx < width && canPlace; dx++) {
          for (let dy = 0; dy < height && canPlace; dy++) {
            if (occupied.has(`${x + dx},${y + dy}`)) {
              canPlace = false
            }
          }
        }

        if (canPlace) {
          return { x, y }
        }
      }
    }

    return { x: 0, y: 0 }
  }

  private createDefaultDataSource(widgetType: string): any {
    switch (widgetType) {
      case "chart":
        return this.dataSourceService.createStaticDataSource(this.dataSourceService.generateSampleChartData())

      case "stats":
        return this.dataSourceService.createStaticDataSource(this.dataSourceService.generateSampleStatsData())

      case "table":
        return this.dataSourceService.createStaticDataSource(this.dataSourceService.generateSampleTableData())

      case "text":
        return this.dataSourceService.createStaticDataSource({
          content: "<h2>Sample Text Widget</h2><p>This is a sample text widget.</p>",
        })

      default:
        return this.dataSourceService.createStaticDataSource({})
    }
  }
}
