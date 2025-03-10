// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-shedule-form',
//   imports: [],
//   templateUrl: './shedule-form.component.html',
//   styleUrl: './shedule-form.component.scss'
// })
// export class SheduleFormComponent {

// }


import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ScheduleCreateDto } from 'src/app/models/dto/ScheduleCreateDto';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="scheduleForm" (ngSubmit)="onSubmit()">
      <div>
        <label for="userId">User ID</label>
        <input id="userId" formControlName="userId" type="number" required />
      </div>
      <div>
        <label for="courseId">Course ID (Optional)</label>
        <input id="courseId" formControlName="courseId" type="number" />
      </div>
      <div>
        <label for="title">Title</label>
        <input id="title" formControlName="title" required />
      </div>
      <div>
        <label for="startTime">Start Time</label>
        <input id="startTime" type="datetime-local" formControlName="startTime" required />
      </div>
      <div>
        <label for="endTime">End Time</label>
        <input id="endTime" type="datetime-local" formControlName="endTime" required />
      </div>
      <div>
        <label for="recurrence">Recurrence (Optional)</label>
        <input id="recurrence" formControlName="recurrence" />
      </div>
      <div>
        <label for="location">Location (Optional)</label>
        <input id="location" formControlName="location" />
      </div>
      <div>
        <label for="status">Status</label>
        <select id="status" formControlName="status" required>
          <option value="SCHEDULED">Scheduled</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <button type="submit" [disabled]="scheduleForm.invalid">Add Schedule</button>
    </form>
  `,
})
export class ScheduleFormComponent {
  scheduleForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.scheduleForm = this.fb.group({
      userId: [null, Validators.required],
      courseId: [null],
      title: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      recurrence: [''],
      location: [''],
      status: ['SCHEDULED', Validators.required],
    });
  }

  onSubmit(): void {
    const schedule: ScheduleCreateDto = this.scheduleForm.value;
    this.http.post('/api/schedules', schedule).subscribe(() => {
      alert('Schedule added successfully!');
      this.scheduleForm.reset();
    });
  }
}
