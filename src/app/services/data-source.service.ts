import { Injectable } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import { Observable, of } from "rxjs"
import { catchError } from "rxjs/operators"
import type { DataSource } from "../models/dashboard.model"

@Injectable({
  providedIn: "root",
})
export class DataSourceService {
  constructor(private http: HttpClient) {}

  fetchData(dataSource: DataSource): Observable<any> {
    if (!dataSource) {
      return of(null)
    }

    switch (dataSource.type) {
      case "static":
        return of(dataSource.data || {})

      case "api":
        return this.fetchFromApi(dataSource.config)

      case "function":
        return this.executeFunction(dataSource.config)

      case "database":
        return this.fetchFromDatabase(dataSource.config)

      default:
        return of(null)
    }
  }

  private fetchFromApi(config: any): Observable<any> {
    const { url, method = "GET", headers = {}, params = {}, body = null } = config

    if (!url) {
      return of({ error: "URL is required" })
    }

    return this.http
      .request(method, url, {
        headers,
        params,
        body,
      })
      .pipe(
        catchError((error) => {
          console.error("API request error:", error)
          return of({ error: `Failed to fetch data: ${error.message || "Unknown error"}` })
        }),
      )
  }

  private executeFunction(config: any): Observable<any> {
    const { function: fnString } = config

    if (!fnString) {
      return of({ error: "Function is required" })
    }

    try {
      const fn = new Function("return " + fnString)()
      const result = fn()
      return result instanceof Observable ? result : of(result)
    } catch (error: any) {
      console.error("Function execution error:", error)
      return of({ error: `Failed to execute function: ${error.message || "Unknown error"}` })
    }
  }

  private fetchFromDatabase(config: any): Observable<any> {
    return of({
      message: "Database connection would be implemented here",
      config,
    })
  }

  // Helper methods for creating data sources
  createStaticDataSource(data: any): DataSource {
    return {
      type: "static",
      config: {},
      data,
    }
  }

  createApiDataSource(url: string, method = "GET", headers: any = {}, params: any = {}, body: any = null): DataSource {
    return {
      type: "api",
      config: {
        url,
        method,
        headers,
        params,
        body,
      },
    }
  }

  // Sample data generators
  generateSampleChartData(): any {
    const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    return {
      series: [
        {
          name: "Sales",
          data: categories.map(() => Math.floor(Math.random() * 1000) + 100),
        },
        {
          name: "Revenue",
          data: categories.map(() => Math.floor(Math.random() * 2000) + 500),
        },
      ],
      categories,
    }
  }

  generateSampleStatsData(): any {
    return {
      stats: [
        {
          label: "Total Users",
          value: Math.floor(Math.random() * 10000) + 1000,
          icon: "person",
          change: Math.floor(Math.random() * 20) - 10,
        },
        {
          label: "Revenue",
          value: Math.floor(Math.random() * 100000) + 10000,
          prefix: "$",
          icon: "attach_money",
          change: Math.floor(Math.random() * 20) - 10,
        },
        {
          label: "Orders",
          value: Math.floor(Math.random() * 1000) + 100,
          icon: "shopping_cart",
          change: Math.floor(Math.random() * 20) - 10,
        },
      ],
    }
  }

  generateSampleTableData(): any {
    const columns = [
      { name: "id", label: "ID", type: "number" },
      { name: "name", label: "Name", type: "string" },
      { name: "email", label: "Email", type: "string" },
      { name: "status", label: "Status", type: "string" },
    ]

    const statuses = ["Active", "Inactive", "Pending"]
    const names = ["John Doe", "Jane Smith", "Robert Johnson", "Emily Davis"]

    const rows = Array(10)
      .fill(0)
      .map((_, i) => ({
        id: i + 1,
        name: names[Math.floor(Math.random() * names.length)],
        email: `user${i + 1}@example.com`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      }))

    return { columns, rows }
  }
}
