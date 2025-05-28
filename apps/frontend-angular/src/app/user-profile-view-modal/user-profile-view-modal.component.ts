import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthServiceService, User} from "../auth-service.service";
import {environment} from "../../environments/environment";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {UserService} from "../user.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {FileUpload, FileUploadHandlerEvent, FileUploadModule} from "primeng/fileupload";
import {CardModule} from "primeng/card";
import {AvatarModule} from "primeng/avatar";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-user-profile-view-modal',
  imports: [
    CardModule,
    AvatarModule,
    FileUploadModule,
    NgIf
  ],
  templateUrl: './user-profile-view-modal.component.html',
  standalone: true,
  styleUrl: './user-profile-view-modal.component.scss'
})
export class UserProfileViewModalComponent implements OnInit {
  user: User | null = null;
  userId: string;
  isLoading: boolean = true;
  profilePictureUrl: string | undefined = undefined;
  uploadUrl: string = '';
  canEditProfilePic: boolean = false;
  serverBaseUrl = environment.serverBaseUrl || ''; // For constructing image URLs, ensure this exists in your environment files
  @ViewChild('fileUploader') fileUploader!: FileUpload;
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private userService: UserService,
    private authService: AuthServiceService,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.userId = this.config.data.userId;
    this.uploadUrl = `${environment.apiUrl}/users/${this.userId}/profile-picture`;
  }

  ngOnInit(): void {
    this.loadUserData();
    this.checkEditPermissions();
  }

  checkEditPermissions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.canEditProfilePic = (currentUser.id === this.userId) || currentUser.isAdmin;
    }
  }

  loadUserData(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (userData) => {
        this.user = userData;
        this.updateProfilePictureUrl();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error fetching user data for modal:", err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les données utilisateur.' });
        this.isLoading = false;
        this.ref.close(); // Close modal on error
      }
    });
  }

  updateProfilePictureUrl(): void {
    if (this.user && this.user.profilePicture) {
      // Add a timestamp to break browser cache when picture is updated
      this.profilePictureUrl = `${this.serverBaseUrl}/uploads/profile-pictures/${this.user.profilePicture}?t=${new Date().getTime()}`;
    } else {
      this.profilePictureUrl = undefined; // Or path to a default avatar
    }
  }

  getAvatarLabel(): string {
    if (this.user) {
      const prenomInitial = this.user.prenom ? this.user.prenom[0].toUpperCase() : '';
      const nomInitial = this.user.nom ? this.user.nom[0].toUpperCase() : '';
      return prenomInitial + nomInitial;
    }
    return '??';
  }

  // Custom upload handler for p-fileUpload
  customUploadHandler(event: FileUploadHandlerEvent): void {
    const file = event.files[0];
    if (!file) return;

    const formData: FormData = new FormData();
    formData.append('profilePic', file, file.name); // 'profilePic' must match backend multer field name

    const token = this.authService.getToken();
    if (!token) {
      this.messageService.add({ severity: 'error', summary: 'Erreur Auth', detail: 'Non authentifié.' });
      // Clear files from uploader
      this.fileUploader.clear()
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // 'Content-Type' is not needed; browser sets it for FormData
    });

    this.http.post<{ message: string, filePath: string, filename: string }>(this.uploadUrl, formData, { headers, reportProgress: true, observe: 'events' })
      .subscribe({
        next: (httpEvent: any) => { // Using any for httpEvent due to observe:'events'
          if (httpEvent.type === 1 /* UploadProgress */) {
            // You can update progress bar here if p-fileUpload doesn't do it automatically with custom upload
            // const progress = Math.round(100 * httpEvent.loaded / httpEvent.total);
            // console.log(`Progress: ${progress}%`);
          } else if (httpEvent.type === 4 /* Response */) {
            if (this.user) {
              this.user.profilePicture = httpEvent.body.filename; // Update user model
            }
            this.updateProfilePictureUrl(); // Refresh displayed image
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: httpEvent.body.message });
            this.fileUploader.clear()
          }
        },
        error: (err) => {
          console.error("Upload error:", err);
          let detail = 'Échec de l\'upload.';
          if (err.error && err.error.error) {
            detail = err.error.error;
          } else if (err.message) {
            detail = err.message;
          }
          this.messageService.add({ severity: 'error', summary: 'Erreur d\'upload', detail: detail });
          this.fileUploader.clear()
        }
      });
  }

  onUploadError(event: any): void { // Fallback if customUploadHandler has an issue not caught
    const xhr = event.xhr;
    let errorMsg = 'Échec de l\'upload.';
    if (xhr && xhr.responseText) {
      try {
        const err = JSON.parse(xhr.responseText);
        errorMsg = err.error || err.message || errorMsg;
      } catch (e) { /* Ignore parse error */ }
    }
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: errorMsg });
  }
}
