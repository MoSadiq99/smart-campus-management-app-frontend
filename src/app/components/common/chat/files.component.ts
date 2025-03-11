import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FileDto } from './group.service';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  template: `
    <mat-list>
      <mat-list-item *ngFor="let file of files">
        <span matListItemTitle>{{ file.fileName }}</span>
        <span matListItemLine>Uploaded: {{ file.uploadTime | date:'short' }}</span>
      </mat-list-item>
    </mat-list>
    <input type="file" (change)="uploadFile($event)" style="margin-top: 10px;">
  `,
  styles: [`
    mat-list-item { margin-bottom: 10px; }
  `]
})
export class FilesComponent {
  @Input() files: FileDto[] = [];
  @Output() uploadFileEvent = new EventEmitter<Event>();

  uploadFile(event: Event): void {
    this.uploadFileEvent.emit(event);
  }
}
