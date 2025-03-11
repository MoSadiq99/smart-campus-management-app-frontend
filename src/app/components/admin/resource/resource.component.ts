/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResourceService, ResourceDto, ResourceCreateDto } from './resource.service';

@Component({
  selector: 'app-resource',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit {
  resources: ResourceDto[] = [];
  filteredResources: ResourceDto[] = [];
  newResource: ResourceCreateDto = { resourceName: '', type: '', availabilityStatus: 'AVAILABLE', location: '', capacity: 0 };
  selectedResource: ResourceCreateDto & { id?: number } = { resourceName: '', type: '', availabilityStatus: 'AVAILABLE', location: '', capacity: 0 }; // For editing
  selectedResourceType: string = 'All';
  resourceTypes: string[] = ['Classroom', 'Lab', 'Equipment', 'Hall', 'Other'];

  constructor(
    private readonly resourceService: ResourceService,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadResources();
  }

  loadResources(): void {
    this.resourceService.getAllResources().subscribe({
      next: (resources) => {
        this.resources = resources;
        this.filteredResources = [...this.resources];
      },
      error: (err) => console.error('Failed to load resources:', err)
    });
  }

  filterResources(): void {
    this.filteredResources = this.selectedResourceType === 'All'
      ? [...this.resources]
      : this.resources.filter(r => r.type === this.selectedResourceType);
  }

  getAvailableResources(): ResourceDto[] {
    return this.resources.filter(r => r.availabilityStatus === 'AVAILABLE');
  }

  getInUseResources(): ResourceDto[] {
    return this.resources.filter(r => r.availabilityStatus === 'IN_USE');
  }

  openCreateModal(content: any): void {
    this.newResource = { resourceName: '', type: '', availabilityStatus: 'AVAILABLE' };
    this.modalService.open(content, { size: 'lg' });
  }

  createResource(): void {
    if (this.newResource.resourceName && this.newResource.type && this.newResource.availabilityStatus && this.newResource.location && this.newResource.capacity) {
      console.log('Sending resource:', this.newResource);
      this.resourceService.createResource(this.newResource).subscribe({
        next: (resource) => {
          this.resources.push(resource);
          this.filteredResources = [...this.resources];
          this.modalService.dismissAll();
        },
        error: (err) => console.error('Failed to create resource:', err)
      });
    }
  }

  openEditModal(content: any, resource: ResourceDto): void {
    // Pre-fill the selectedResource with the resource data
    this.selectedResource = { ...resource };
    this.modalService.open(content, { size: 'lg' });
  }

  updateResource(): void {
    if (this.selectedResource.id && this.selectedResource.resourceName && this.selectedResource.type && this.selectedResource.availabilityStatus) {
      this.resourceService.updateResource(this.selectedResource.id, this.selectedResource).subscribe({
        next: (updatedResource) => {
          const index = this.resources.findIndex(r => r.id === updatedResource.id);
          if (index !== -1) {
            this.resources[index] = updatedResource;
            this.filteredResources = [...this.resources];
          }
          this.modalService.dismissAll();
        },
        error: (err) => console.error('Failed to update resource:', err)
      });
    }
  }

  deleteResource(resource: ResourceDto): void {
    console.log('deleteResource');
    if (resource.id) {
      console.log('Deleting resource with ID:', resource.id);
      this.resourceService.deleteResource(resource.id).subscribe({
        next: () => {
          this.resources = this.resources.filter(r => r.id !== resource.id);
          this.filteredResources = [...this.resources];
        },
        error: (err) => console.error('Failed to delete resource:', err)
      });
    }
  }
}
