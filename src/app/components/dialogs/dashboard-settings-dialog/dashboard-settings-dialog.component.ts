import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { type MatDialogRef, MatDialogModule } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"

@Component({
  selector: "app-dashboard-settings-dialog",
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
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isNew ? 'Create New Dashboard' : 'Dashboard Settings' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="settingsForm">
        <mat-form-field>
          <mat-label>Dashboard Title</mat-label>
          <input matInput formControlName="title" required>
        </mat-form-field>
        
        <mat-form-field>
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
        
        <mat-form-field>
          <mat-label>Layout</mat-label>
          <mat-select formControlName="layout">
            <mat-option value="grid">Grid Layout</mat-option>
            <mat-option value="freeform">Freeform Layout</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field>
          <mat-label>Theme</mat-label>
          <mat-select formControlName="theme">
            <mat-option value="light">Light Theme</mat-option>
            <mat-option value="dark">Dark Theme</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSave()"
        [disabled]="settingsForm.invalid">
        {{ data.isNew ? 'Create' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }
    
    mat-dialog-content {
      min-width: 400px;
    }
  `,
  ],
})
export class DashboardSettingsDialogComponent implements OnInit {
  settingsForm: FormGroup
  data: any

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DashboardSettingsDialogComponent>,
    matDialogData: any,
  ) {
    this.data = matDialogData
    this.settingsForm = this.fb.group({
      title: [this.data.dashboard?.title || "", Validators.required],
      description: [this.data.dashboard?.description || ""],
      layout: [this.data.dashboard?.layout || "grid"],
      theme: [this.data.dashboard?.theme || "light"],
    })
  }

  ngOnInit(): void {
    // Component initialization
  }

  onSave(): void {
    if (this.settingsForm.valid) {
      this.dialogRef.close(this.settingsForm.value)
    }
  }

  onCancel(): void {
    this.dialogRef.close()
  }
}
