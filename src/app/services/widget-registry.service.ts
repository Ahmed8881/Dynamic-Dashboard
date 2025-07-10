import { Injectable } from "@angular/core"
import type { WidgetTemplate } from "../models/dashboard.model"

@Injectable({
  providedIn: "root",
})
export class WidgetRegistryService {
  private widgetTemplates: WidgetTemplate[] = [
    {
      type: "chart",
      name: "Chart Widget",
      icon: "bar_chart",
      description: "Display data in various chart formats",
      defaultSize: { width: 6, height: 4 },
      defaultConfig: {
        chartType: "line",
        showLegend: true,
        animated: true,
        colors: ["#1976d2", "#f44336", "#4caf50", "#ff9800"],
        xAxisLabel: "X Axis",
        yAxisLabel: "Y Axis",
        showGrid: true,
      },
      configOptions: [
        {
          key: "chartType",
          label: "Chart Type",
          type: "select",
          defaultValue: "line",
          options: [
            { label: "Line Chart", value: "line" },
            { label: "Bar Chart", value: "bar" },
            { label: "Pie Chart", value: "pie" },
            { label: "Doughnut Chart", value: "doughnut" },
          ],
        },
        {
          key: "showLegend",
          label: "Show Legend",
          type: "boolean",
          defaultValue: true,
        },
        {
          key: "animated",
          label: "Animated",
          type: "boolean",
          defaultValue: true,
        },
      ],
      dataOptions: [
        {
          key: "series",
          label: "Data Series",
          type: "array",
          required: true,
          description: "Array of data series objects",
        },
      ],
      component: "ChartWidgetComponent",
    },
    {
      type: "stats",
      name: "Statistics Widget",
      icon: "analytics",
      description: "Show key performance indicators",
      defaultSize: { width: 3, height: 2 },
      defaultConfig: {
        layout: "grid",
        showIcons: true,
        colorScheme: "default",
      },
      configOptions: [
        {
          key: "layout",
          label: "Layout",
          type: "select",
          defaultValue: "grid",
          options: [
            { label: "Grid", value: "grid" },
            { label: "List", value: "list" },
          ],
        },
        {
          key: "showIcons",
          label: "Show Icons",
          type: "boolean",
          defaultValue: true,
        },
      ],
      dataOptions: [
        {
          key: "stats",
          label: "Statistics",
          type: "array",
          required: true,
          description: "Array of statistic objects",
        },
      ],
      component: "StatsWidgetComponent",
    },
    {
      type: "table",
      name: "Data Table",
      icon: "table_view",
      description: "Display tabular data with sorting and filtering",
      defaultSize: { width: 8, height: 5 },
      defaultConfig: {
        sortable: true,
        filterable: true,
        paginated: true,
        pageSize: 10,
      },
      configOptions: [
        {
          key: "sortable",
          label: "Sortable",
          type: "boolean",
          defaultValue: true,
        },
        {
          key: "filterable",
          label: "Filterable",
          type: "boolean",
          defaultValue: true,
        },
        {
          key: "paginated",
          label: "Paginated",
          type: "boolean",
          defaultValue: true,
        },
      ],
      dataOptions: [
        {
          key: "columns",
          label: "Columns",
          type: "array",
          required: true,
          description: "Array of column objects",
        },
        {
          key: "rows",
          label: "Rows",
          type: "array",
          required: true,
          description: "Array of data objects",
        },
      ],
      component: "TableWidgetComponent",
    },
    {
      type: "text",
      name: "Rich Text",
      icon: "article",
      description: "Add formatted text content",
      defaultSize: { width: 4, height: 3 },
      defaultConfig: {
        editorMode: "wysiwyg",
        allowHTML: true,
      },
      configOptions: [
        {
          key: "editorMode",
          label: "Editor Mode",
          type: "select",
          defaultValue: "wysiwyg",
          options: [
            { label: "WYSIWYG", value: "wysiwyg" },
            { label: "Markdown", value: "markdown" },
          ],
        },
        {
          key: "allowHTML",
          label: "Allow HTML",
          type: "boolean",
          defaultValue: true,
        },
      ],
      dataOptions: [
        {
          key: "content",
          label: "Content",
          type: "string",
          required: true,
          description: "Text content",
        },
      ],
      component: "TextWidgetComponent",
    },
  ]

  getWidgetTemplates(): WidgetTemplate[] {
    return [...this.widgetTemplates]
  }

  getWidgetTemplate(type: string): WidgetTemplate | undefined {
    return this.widgetTemplates.find((template) => template.type === type)
  }

  registerWidgetTemplate(template: WidgetTemplate): void {
    const existingIndex = this.widgetTemplates.findIndex((t) => t.type === template.type)

    if (existingIndex !== -1) {
      this.widgetTemplates[existingIndex] = template
    } else {
      this.widgetTemplates.push(template)
    }
  }
}
