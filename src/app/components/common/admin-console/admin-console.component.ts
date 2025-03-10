import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-console',
  template: `
    <div class="container">
      <h1 class="text-2xl font-bold mb-4">Admin Console</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card p-4 shadow rounded-lg">
          <h2 class="text-lg font-semibold">Manage Users</h2>
          <button class="btn mt-2 w-full">Add Users</button>
        </div>
        <div class="card p-4 shadow rounded-lg">
          <h2 class="text-lg font-semibold">Manage Courses</h2>
          <button class="btn mt-2 w-full">Create Course</button>
        </div>
        <div class="card p-4 shadow rounded-lg">
          <h2 class="text-lg font-semibold">Manage Subjects</h2>
          <button class="btn mt-2 w-full">Create Subject</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 800px;
        margin: auto;
        padding: 20px;
      }
      .btn {
        background-color: #007bff;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .btn:hover {
        background-color: #0056b3;
      }
    `
  ]
})
export class AdminConsoleComponent {}
