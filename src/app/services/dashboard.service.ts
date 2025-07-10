import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable, of } from "rxjs"
import type { HttpClient } from "@angular/common/http"
import { catchError } from "rxjs/operators"
import type { DashboardConfig, Widget } from "../models/dashboard.model"

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  private readonly STORAGE_KEY = "dashboard_configs"
  private readonly CURRENT_DASHBOARD_KEY = "current_dashboard"

  private dashboardsSubject = new BehaviorSubject<DashboardConfig[]>([])
  private currentDashboardSubject = new BehaviorSubject<DashboardConfig | null>(null)

  dashboards$ = this.dashboardsSubject.asObservable()
  currentDashboard$ = this.currentDashboardSubject.asObservable()

  constructor(private http: HttpClient) {
    this.loadDashboards()
    this.loadCurrentDashboard()
  }

  // Dashboard CRUD operations
  getDashboards(): Observable<DashboardConfig[]> {
    return this.dashboards$
  }

  getCurrentDashboard(): Observable<DashboardConfig | null> {
    return this.currentDashboard$
  }

  setCurrentDashboard(dashboardId: string): void {
    const dashboards = this.dashboardsSubject.value
    const dashboard = dashboards.find((d) => d.id === dashboardId)

    if (dashboard) {
      this.currentDashboardSubject.next(dashboard)
      localStorage.setItem(this.CURRENT_DASHBOARD_KEY, dashboardId)
    }
  }

  createDashboard(dashboard: Partial<DashboardConfig>): string {
    const now = Date.now()
    const newDashboard: DashboardConfig = {
      id: `dashboard_${now}_${Math.random().toString(36).substring(2, 9)}`,
      title: dashboard.title || "New Dashboard",
      description: dashboard.description || "",
      widgets: dashboard.widgets || [],
      layout: dashboard.layout || "grid",
      theme: dashboard.theme || "light",
      customTheme: dashboard.customTheme,
      createdAt: now,
      updatedAt: now,
    }

    const dashboards = [...this.dashboardsSubject.value, newDashboard]
    this.dashboardsSubject.next(dashboards)
    this.saveDashboards(dashboards)
    this.setCurrentDashboard(newDashboard.id)

    return newDashboard.id
  }

  updateDashboard(dashboard: DashboardConfig): void {
    const dashboards = this.dashboardsSubject.value
    const index = dashboards.findIndex((d) => d.id === dashboard.id)

    if (index !== -1) {
      const updatedDashboard = {
        ...dashboard,
        updatedAt: Date.now(),
      }

      dashboards[index] = updatedDashboard
      this.dashboardsSubject.next([...dashboards])
      this.saveDashboards(dashboards)

      if (this.currentDashboardSubject.value?.id === dashboard.id) {
        this.currentDashboardSubject.next(updatedDashboard)
      }
    }
  }

  deleteDashboard(dashboardId: string): void {
    const dashboards = this.dashboardsSubject.value.filter((d) => d.id !== dashboardId)
    this.dashboardsSubject.next(dashboards)
    this.saveDashboards(dashboards)

    if (this.currentDashboardSubject.value?.id === dashboardId) {
      this.currentDashboardSubject.next(dashboards[0] || null)
      localStorage.setItem(this.CURRENT_DASHBOARD_KEY, dashboards[0]?.id || "")
    }
  }

  // Widget operations
  addWidget(dashboardId: string, widget: Widget): void {
    const dashboards = this.dashboardsSubject.value
    const dashboard = dashboards.find((d) => d.id === dashboardId)

    if (dashboard) {
      dashboard.widgets.push(widget)
      dashboard.updatedAt = Date.now()

      this.dashboardsSubject.next([...dashboards])
      this.saveDashboards(dashboards)

      if (this.currentDashboardSubject.value?.id === dashboardId) {
        this.currentDashboardSubject.next({ ...dashboard })
      }
    }
  }

  updateWidget(dashboardId: string, widget: Widget): void {
    const dashboards = this.dashboardsSubject.value
    const dashboard = dashboards.find((d) => d.id === dashboardId)

    if (dashboard) {
      const index = dashboard.widgets.findIndex((w) => w.id === widget.id)

      if (index !== -1) {
        dashboard.widgets[index] = widget
        dashboard.updatedAt = Date.now()

        this.dashboardsSubject.next([...dashboards])
        this.saveDashboards(dashboards)

        if (this.currentDashboardSubject.value?.id === dashboardId) {
          this.currentDashboardSubject.next({ ...dashboard })
        }
      }
    }
  }

  removeWidget(dashboardId: string, widgetId: string): void {
    const dashboards = this.dashboardsSubject.value
    const dashboard = dashboards.find((d) => d.id === dashboardId)

    if (dashboard) {
      dashboard.widgets = dashboard.widgets.filter((w) => w.id !== widgetId)
      dashboard.updatedAt = Date.now()

      this.dashboardsSubject.next([...dashboards])
      this.saveDashboards(dashboards)

      if (this.currentDashboardSubject.value?.id === dashboardId) {
        this.currentDashboardSubject.next({ ...dashboard })
      }
    }
  }

  // Data fetching for widgets
  fetchWidgetData(widget: Widget): Observable<any> {
    if (!widget.dataSource) {
      return of(null)
    }

    switch (widget.dataSource.type) {
      case "static":
        return of(widget.dataSource.data)

      case "api":
        const { url, method, headers, body } = widget.dataSource.config
        return this.http
          .request(method || "GET", url, {
            headers,
            body,
          })
          .pipe(
            catchError((error) => {
              console.error("Error fetching widget data:", error)
              return of({ error: "Failed to fetch data" })
            }),
          )

      case "function":
        try {
          const fn = new Function("return " + widget.dataSource.config.function)()
          const result = fn()
          return result instanceof Observable ? result : of(result)
        } catch (error) {
          console.error("Error executing function:", error)
          return of({ error: "Failed to execute function" })
        }

      case "database":
        return of({ message: "Database connection not implemented" })

      default:
        return of(null)
    }
  }

  // Import/Export
  exportDashboard(dashboardId: string): string {
    const dashboard = this.dashboardsSubject.value.find((d) => d.id === dashboardId)
    return dashboard ? JSON.stringify(dashboard) : ""
  }

  importDashboard(dashboardJson: string): boolean {
    try {
      const dashboard = JSON.parse(dashboardJson) as DashboardConfig

      if (!dashboard.id || !dashboard.title) {
        return false
      }

      dashboard.id = `dashboard_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      const dashboards = [...this.dashboardsSubject.value, dashboard]
      this.dashboardsSubject.next(dashboards)
      this.saveDashboards(dashboards)

      return true
    } catch (error) {
      console.error("Error importing dashboard:", error)
      return false
    }
  }

  // Storage operations
  private loadDashboards(): void {
    try {
      const storedDashboards = localStorage.getItem(this.STORAGE_KEY)

      if (storedDashboards) {
        const dashboards = JSON.parse(storedDashboards) as DashboardConfig[]
        this.dashboardsSubject.next(dashboards)
      } else {
        this.createDefaultDashboard()
      }
    } catch (error) {
      console.error("Error loading dashboards:", error)
      this.createDefaultDashboard()
    }
  }

  private loadCurrentDashboard(): void {
    try {
      const currentDashboardId = localStorage.getItem(this.CURRENT_DASHBOARD_KEY)

      if (currentDashboardId) {
        const dashboards = this.dashboardsSubject.value
        const currentDashboard = dashboards.find((d) => d.id === currentDashboardId)

        if (currentDashboard) {
          this.currentDashboardSubject.next(currentDashboard)
        } else if (dashboards.length > 0) {
          this.currentDashboardSubject.next(dashboards[0])
          localStorage.setItem(this.CURRENT_DASHBOARD_KEY, dashboards[0].id)
        }
      } else if (this.dashboardsSubject.value.length > 0) {
        this.currentDashboardSubject.next(this.dashboardsSubject.value[0])
        localStorage.setItem(this.CURRENT_DASHBOARD_KEY, this.dashboardsSubject.value[0].id)
      }
    } catch (error) {
      console.error("Error loading current dashboard:", error)
    }
  }

  private saveDashboards(dashboards: DashboardConfig[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dashboards))
    } catch (error) {
      console.error("Error saving dashboards:", error)
    }
  }

  private createDefaultDashboard(): void {
    const now = Date.now()
    const defaultDashboard: DashboardConfig = {
      id: `dashboard_${now}_default`,
      title: "My Dashboard",
      description: "Welcome to your new dashboard",
      widgets: [],
      layout: "grid",
      theme: "light",
      createdAt: now,
      updatedAt: now,
    }

    this.dashboardsSubject.next([defaultDashboard])
    this.currentDashboardSubject.next(defaultDashboard)
    this.saveDashboards([defaultDashboard])
    localStorage.setItem(this.CURRENT_DASHBOARD_KEY, defaultDashboard.id)
  }
}
