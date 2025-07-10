import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatDialogRef } from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [CommonModule, MatDialogRef, MatButtonModule, MatIconModule],
  template: `
    <h2>
      <mat-icon color="warn">warning</mat-icon>
      {{ data.title }}
    </h2>
    
    <div>
      <p>{{ data.message }}</p>
    </div>
    
    <div align="end">
      <button (click)="onCancel()">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button color="warn" (click)="onConfirm()">
        {{ data.confirmText || 'Confirm' }}
      </button>
    </div>
  `,
  styles: [
    `
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    div {
      min-width: 300px;
    }
  `,
  ],
})
export class ConfirmDialogComponent {
  data: any
  dialogRef: any

  constructor(dialogRef: any, data: any) {
    this.dialogRef = dialogRef
    this.data = data
  }

  onConfirm(): void {
    this.dialogRef.close(true)
  }

  onCancel(): void {
    this.dialogRef.close(false)
  }
}
