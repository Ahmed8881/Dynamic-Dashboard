import { Component, Input, Output, EventEmitter, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatTableModule } from "@angular/material/table"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSortModule } from "@angular/material/sort"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-table-widget",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  template: `
    <div class="table-container" *ngIf="data?.columns && data?.rows">
      <mat-form-field *ngIf="config.filterable" class="filter-field">
        <mat-label>Filter</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Search...">
      </mat-form-field>
      
      <mat-table 
        [dataSource]="filteredData" 
        [class.striped]="config.striped"
        [class.bordered]="config.bordered"
        [class.dense]="config.dense"
        matSort>
        
        <ng-container *ngFor="let column of data.columns" [matColumnDef]="column.name">
          <mat-header-cell *matHeaderCellDef [mat-sort-header]="config.sortable ? column.name : null">
            {{ column.label }}
          </mat-header-cell>
          <mat-cell *matCellDef="let row">
            {{ formatCellValue(row[column.name], column.type) }}
          </mat-cell>
        </ng-container>
        
        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
      </mat-table>
      
      <mat-paginator 
        *ngIf="config.paginated"
        [pageSizeOptions]="[5, 10, 20, 50]"
        [pageSize]="config.pageSize || 10"
        showFirstLastButtons>
      </mat-paginator>
    </div>
    
    <div class="no-data" *ngIf="!data?.columns || !data?.rows?.length">
      <p>No table data available</p>
    </div>
  `,
  styles: [
    `
    .table-container {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .filter-field {
      width: 100%;
      margin-bottom: 16px;
    }
    
    mat-table {
      flex: 1;
      overflow: auto;
      
      &.striped {
        mat-row:nth-child(even) {
          background-color: #f8f9fa;
        }
      }
      
      &.bordered {
        border: 1px solid #e0e0e0;
        
        mat-header-cell, mat-cell {
          border-right: 1px solid #e0e0e0;
          
          &:last-child {
            border-right: none;
          }
        }
      }
      
      &.dense {
        mat-header-cell, mat-cell {
          padding: 8px;
        }
      }
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
export class TableWidgetComponent implements OnInit {
  @Input() data: any
  @Input() config: any = {}
  @Output() dataChange = new EventEmitter<any>()

  displayedColumns: string[] = []
  filteredData: any[] = []

  ngOnInit(): void {
    this.setupTable()
  }

  private setupTable(): void {
    if (this.data?.columns) {
      this.displayedColumns = this.data.columns.map((col: any) => col.name)
      this.filteredData = [...(this.data.rows || [])]
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase()

    if (!filterValue) {
      this.filteredData = [...this.data.rows]
      return
    }

    this.filteredData = this.data.rows.filter((row: any) =>
      Object.values(row).some((value: any) => value?.toString().toLowerCase().includes(filterValue)),
    )
  }

  formatCellValue(value: any, type: string): string {
    if (value === null || value === undefined) {
      return ""
    }

    switch (type) {
      case "date":
        return new Date(value).toLocaleDateString()
      case "number":
        return typeof value === "number" ? value.toLocaleString() : value
      default:
        return value.toString()
    }
  }
}
