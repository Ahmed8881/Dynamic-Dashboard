import { Component, Input, Output, EventEmitter, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-text-widget",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-container" *ngIf="data?.content">
      <div 
        class="text-content"
        [innerHTML]="config.allowHTML ? data.content : null">
        <span *ngIf="!config.allowHTML">{{ data.content }}</span>
      </div>
    </div>
    
    <div class="no-data" *ngIf="!data?.content">
      <p>No text content available</p>
    </div>
  `,
  styles: [
    `
    .text-container {
      height: 100%;
      width: 100%;
      overflow: auto;
    }
    
    .text-content {
      line-height: 1.6;
      color: #333;
      
      h1, h2, h3, h4, h5, h6 {
        margin-top: 0;
        margin-bottom: 16px;
        color: #333;
      }
      
      p {
        margin-bottom: 16px;
      }
      
      ul, ol {
        margin-bottom: 16px;
        padding-left: 24px;
      }
      
      blockquote {
        border-left: 4px solid var(--primary-color);
        padding-left: 16px;
        margin: 16px 0;
        font-style: italic;
        color: #666;
      }
      
      code {
        background: #f8f9fa;
        padding: 2px 4px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
      }
      
      pre {
        background: #f8f9fa;
        padding: 16px;
        border-radius: 4px;
        overflow-x: auto;
        
        code {
          background: none;
          padding: 0;
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
export class TextWidgetComponent implements OnInit {
  @Input() data: any
  @Input() config: any = {}
  @Output() dataChange = new EventEmitter<any>()

  ngOnInit(): void {
    // Component initialization
  }
}
