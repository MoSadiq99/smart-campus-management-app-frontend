import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserDto } from 'src/app/models/dto/UserDto';
import { UserService } from 'src/app/services/auth/user.service';
import { FormsModule } from '@angular/forms';
import { StudentDto } from 'src/app/models/student-dto';
import { LecturerDto } from 'src/app/models/dto/LecturerDto';
import { AdminDto } from 'src/app/models/dto/AdminDto';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  userDetails: UserDto | null = null;
  studentDto: StudentDto | null = null;
  lecturerDto: LecturerDto | null = null;
  adminDto: AdminDto | null = null;

  constructor(
    private userService: UserService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
  }

  getUserDetails() {
    this.userService.getUserById(this.authenticationService.getCurrentUserId()).subscribe({
      next: (response) => {
        this.userDetails = response;
        this.getExtendedUserDetails();
        console.log(this.userDetails);
      }
    });
  }

  getExtendedUserDetails() {
    if (this.userDetails?.roleName === 'ROLE_STUDENT') {
      this.userService.getStudentById(this.userDetails.userId).subscribe({
        next: (response) => {
          this.studentDto = response;
          console.log(this.studentDto);
        }
      });
    } else if (this.userDetails?.roleName === 'ROLE_LECTURER') {
      console.log(`User is a lecturer`);
      this.userService.getLecturerById(this.userDetails.userId).subscribe({
        next: (response) => {
          this.lecturerDto = response;
          console.log(this.studentDto);
        }
      });
    } else if (this.userDetails?.roleName === 'ROLE_ADMIN') {
      this.userService.getAdminById(this.userDetails.userId).subscribe({
        next: (response) => {
          this.adminDto = response;
          console.log(this.studentDto);
        }
      });
    }
  }

  getProfileImageURL() {
    if (this.userDetails) {
      return `${environment.images}/${this.userDetails.profileImage}`;
    }
    return environment.images + 'default-avatar.png';
  }

  saveChanges() {
    this.userService.updateUser(this.userDetails).subscribe({
      next: (response) => {
        this.userDetails = response;
        if (!response) {
          alert('Error!');
        }
        alert('Changes saved successfully');
        console.log(this.userDetails);
      },
      error: (error) => {
        console.error('Error saving changes:', error);
        alert('Error saving changes');
      }
    });
  }
}
