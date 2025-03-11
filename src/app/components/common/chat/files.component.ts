import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileDto } from './group.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="files-container">
      <div class="files-header">
        <h3>Shared Files</h3>
        <button mat-raised-button color="primary" (click)="fileInput.click()">
        <mat-icon fontSet="fa" fontIcon="fa-upload"></mat-icon>
          Upload File
        </button>
        <input hidden (change)="onFileSelected($event)" #fileInput type="file">
      </div>

      <mat-list>
        <ng-container *ngIf="files.length > 0; else noFiles">
          <mat-list-item *ngFor="let file of files" class="file-item">
            <mat-icon matListItemIcon [ngClass]="getFileIconClass(file.fileName)">
              {{ getFileIcon(file.fileName) }}
            </mat-icon>
            <div matListItemTitle>{{ file.fileName }}</div>
            <div matListItemLine>
              Uploaded: {{ file.uploadTime | date:'medium' }}
            </div>
            <button mat-icon-button matListItemMeta color="primary" class="download-icon"
                    matTooltip="Download File" (click)="downloadFile(file)">
              <mat-icon fontSet="fa" fontIcon="fa-download"></mat-icon>
            </button>
          </mat-list-item>
        </ng-container>

        <mat-icon>download</mat-icon>
        <ng-template #noFiles>
          <div class="no-files">
            <mat-icon>folder_open</mat-icon>
            <p>No files have been shared in this group yet.</p>
          </div>
        </ng-template>
      </mat-list>
    </div>
  `,
  styles: [`
    .download-icon {
      margin-top:30px
    }

    .files-container {
      padding: 26px;
    }

    .files-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .file-item {
      margin-bottom: 8px;
      border-radius: 4px;
      background-color: #f5f5f5;
    }

    .no-files {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      color: #757575;
    }

    .no-files mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    .file-icon-doc {
      color: #4285F4;
    }

    .file-icon-sheet {
      color: #0F9D58;
    }

    .file-icon-pdf {
      color: #DB4437;
    }

    .file-icon-image {
      color: #F4B400;
    }
  `]
})
export class FilesComponent {
  @Input() files: FileDto[] = [];
  @Output() uploadFileEvent = new EventEmitter<Event>();

  constructor(private readonly http: HttpClient) {}

  onFileSelected(event: Event): void {
    this.uploadFileEvent.emit(event);
  }

  downloadFile(file: FileDto): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    file.groupId = 1; // Replace with actual groupId from the group
    const url = `http://localhost:8080/api/groups/${file.groupId}/files/${file.fileId}`; // OR /api/files/download/${file.id}

    // Set headers with Authorization
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Fetch the file as a blob
    this.http.get(url, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = file.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      },
      error: (err) => {
        console.error('File download failed:', err);
      }
    });
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch(extension) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'table_chart';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'ppt':
      case 'pptx':
        return 'slideshow';
      case 'zip':
      case 'rar':
        return 'archive';
      default:
        return 'insert_drive_file';
    }
  }

  getFileIconClass(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch(extension) {
      case 'pdf':
        return 'file-icon-pdf';
      case 'doc':
      case 'docx':
        return 'file-icon-doc';
      case 'xls':
      case 'xlsx':
        return 'file-icon-sheet';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'file-icon-image';
      default:
        return '';
    }
  }
}
