import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { MatDialogRef } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatTabsModule } from "@angular/material/tabs"
import { MatIconModule } from "@angular/material/icon"
import { MatCardModule } from "@angular/material/card"
import { MatDialogModule } from "@angular/material/dialog" // Added import for MatDialogModule

@Component({
  selector: "app-add-widget-dialog",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
  ],
  template: `
    <h2 mat-dialog-title>Add New Widget</h2>
    
    <mat-dialog-content>
      <mat-tab-group>
        <mat-tab label="Widget Type">
          <div class="widget-templates">
            <mat-card 
              *ngFor="let template of data.templates"
              class="template-card"
              [class.selected]="selectedTemplate?.type === template.type"
              (click)="selectTemplate(template)">
              <mat-card-content>
                <div class="template-icon">
                  <mat-icon>{{ template.icon }}</mat-icon>
                </div>
                <h3>{{ template.name }}</h3>
                <p>{{ template.description }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <mat-tab label="Configuration" [disabled]="!selectedTemplate">
          <form [formGroup]="configForm" *ngIf="selectedTemplate">
            <mat-form-field>
              <mat-label>Widget Title</mat-label>
              <input matInput formControlName="title" required>
            </mat-form-field>
            
            <mat-form-field>
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>
            
            <div class="size-controls">
              <mat-form-field>
                <mat-label>Width</mat-label>
                <input matInput type="number" formControlName="width" min="1" max="12">
              </mat-form-field>
              
              <mat-form-field>
                <mat-label>Height</mat-label>
                <input matInput type="number" formControlName="height" min="1" max="10">
              </mat-form-field>
            </div>
          </form>
        </mat-tab>
        
        <mat-tab label="Data Source" [disabled]="!selectedTemplate">
          <div class="data-source-config" *ngIf="selectedTemplate">
            <mat-form-field>
              <mat-label>Data Source Type</mat-label>
              <mat-select [(value)]="dataSourceType">
                <mat-option value="static">Static Data</mat-option>
                <mat-option value="api">API Endpoint</mat-option>
                <mat-option value="function">Custom Function</mat-option>
              </mat-select>
            </mat-form-field>
            
            <div [ngSwitch]="dataSourceType">
              <div *ngSwitchCase="'static'">
                <button mat-button color="primary" (click)="generateSampleData()">
                  Generate Sample Data
                </button>
              </div>
              
              <div *ngSwitchCase="'api'">
                <mat-form-field>
                  <mat-label>API URL</mat-label>
                  <input matInput [(ngModel)]="apiConfig.url" placeholder="https://api.example.com/data">
                </mat-form-field>
                
                <mat-form-field>
                  <mat-label>Method</mat-label>
                  <mat-select [(ngModel)]="apiConfig.method">
                    <mat-option value="GET">GET</mat-option>
                    <mat-option value="POST">POST</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              
              <div *ngSwitchCase="'function'">
                <mat-form-field>
                  <mat-label>Custom Function</mat-label>
                  <textarea 
                    matInput 
                    [(ngModel)]="functionConfig.function"
                    rows="6"
                    placeholder="function() { return { data: 'example' }; }">
                  </textarea>
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSave()"
        [disabled]="!canSave()">
        Add Widget
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
    .widget-templates {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      padding: 16px 0;
    }
    
    .template-card {
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      &.selected {
        border-color: var(--primary-color);
        background: rgba(25, 118, 210, 0.05);
      }
    }
    
    .template-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--primary-color);
      }
    }
    
    .template-card h3 {
      text-align: center;
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .template-card p {
      text-align: center;
      margin: 0;
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
    
    .size-controls {
      display: flex;
      gap: 16px;
      
      mat-form-field {
        flex: 1;
      }
    }
    
    .data-source-config {
      padding: 16px 0;
    }
    
    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }
  `,
  ],
})
export class AddWidgetDialogComponent implements OnInit {
  selectedTemplate: any = null
  configForm: FormGroup
  dataSourceType = "static"

  apiConfig = {
    url: "",
    method: "GET",
  }

  functionConfig = {
    function: "function() {\n  return {\n    // Your data here\n  };\n}",
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddWidgetDialogComponent>,
    public data: any,
  ) {
    this.configForm = this.fb.group({
      title: ["", Validators.required],
      description: [""],
      width: [4, [Validators.required, Validators.min(1), Validators.max(12)]],
      height: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
    })
  }

  ngOnInit(): void {
    // Component initialization
  }

  selectTemplate(template: any): void {
    this.selectedTemplate = template
    this.configForm.patchValue({
      title: template.name,
      width: template.defaultSize.width,
      height: template.defaultSize.height,
    })
  }

  generateSampleData(): void {
    if (!this.selectedTemplate) return

    // Generate sample data based on widget type
    // This would use the data source service
  }

  canSave(): boolean {
    return this.selectedTemplate && this.configForm.valid
  }

  onSave(): void {
    if (!this.canSave()) return

    const formValue = this.configForm.value
    const result = {
      type: this.selectedTemplate.type,
      config: {
        title: formValue.title,
        description: formValue.description,
        size: {
          width: formValue.width,
          height: formValue.height,
        },
      },
      dataSource: this.createDataSource(),
    }

    this.dialogRef.close(result)
  }

  onCancel(): void {
    this.dialogRef.close()
  }

  private createDataSource(): any {
    switch (this.dataSourceType) {
      case "api":
        return this.data.dataSourceService.createApiDataSource(this.apiConfig.url, this.apiConfig.method)

      case "function":
        return this.data.dataSourceService.createFunctionDataSource(this.functionConfig.function)

      case "static":
      default:
        // Generate sample data based on widget type
        let sampleData = {}
        switch (this.selectedTemplate?.type) {
          case "chart":
            sampleData = this.data.dataSourceService.generateSampleChartData()
            break
          case "stats":
            sampleData = this.data.dataSourceService.generateSampleStatsData()
            break
          case "table":
            sampleData = this.data.dataSourceService.generateSampleTableData()
            break
          default:
            sampleData = {}
        }
        return this.data.dataSourceService.createStaticDataSource(sampleData)
    }
  }
}
