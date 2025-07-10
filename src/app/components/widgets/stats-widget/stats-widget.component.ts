import { Component, Input, Output, EventEmitter, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatIconModule } from "@angular/material/icon"
import { MatCardModule } from "@angular/material/card"

@Component({
  selector: "app-stats-widget",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule],
  template: `
    <div class="stats-container" [class]="config.layout || 'grid'">
      <div 
        class="stat-item" 
        *ngFor="let stat of data?.stats"
        [class.with-icon]="config.showIcons && stat.icon">
        
        <div class="stat-icon" *ngIf="config.showIcons && stat.icon">
          <mat-icon>{{ stat.icon }}</mat-icon>
        </div>
        
        <div class="stat-content">
          <div class="stat-value">
            <span class="prefix" *ngIf="stat.prefix">{{ stat.prefix }}</span>
            {{ formatValue(stat.value) }}
            <span class="suffix" *ngIf="stat.suffix">{{ stat.suffix }}</span>
          </div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-change" *ngIf="stat.change !== undefined" 
               [class.positive]="stat.change > 0"
               [class.negative]="stat.change < 0">
            <mat-icon>{{ stat.change > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
            {{ Math.abs(stat.change) }}%
          </div>
        </div>
      </div>
    </div>
    
    <div class="no-data" *ngIf="!data?.stats?.length">
      <p>No statistics data available</p>
    </div>
  `,
  styles: [
    `
    .stats-container {
      height: 100%;
      width: 100%;
      
      &.grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
      }
      
      &.list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--primary-color);
      
      &.with-icon {
        gap: 16px;
      }
    }
    
    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: rgba(25, 118, 210, 0.1);
      border-radius: 50%;
      
      mat-icon {
        color: var(--primary-color);
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
    
    .stat-content {
      flex: 1;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      line-height: 1.2;
      
      .prefix, .suffix {
        font-size: 18px;
        color: #666;
      }
    }
    
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
    
    .stat-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      margin-top: 8px;
      
      &.positive {
        color: var(--success-color);
      }
      
      &.negative {
        color: var(--warn-color);
      }
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
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
export class StatsWidgetComponent implements OnInit {
  @Input() data: any
  @Input() config: any = {}
  @Output() dataChange = new EventEmitter<any>()

  Math = Math

  ngOnInit(): void {
    // Component initialization
  }

  formatValue(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M"
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K"
    }
    return value.toString()
  }
}
