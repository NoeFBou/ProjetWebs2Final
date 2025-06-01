import { Component } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {NgIf} from "@angular/common";
import {Button} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";
import {environment} from "../../environments/environment";
import {MenuItem, MessageService} from "primeng/api";
import {AuthServiceService} from "../auth-service.service";
import {StepsModule} from "primeng/steps";
import {InputTextModule} from "primeng/inputtext";
import {AvatarModule} from "primeng/avatar";
import {FileUploadModule} from "primeng/fileupload";
import {CardModule} from "primeng/card";

@Component({
  selector: 'app-register-modal',
  imports: [
    FormsModule,
    DialogModule,
    NgIf,
    CheckboxModule,
    Button,
    StepsModule,
    InputTextModule,
    AvatarModule,
    FileUploadModule,
    CardModule
  ],
  templateUrl: './register-modal.component.html',
  standalone: true,
  styleUrl: './register-modal.component.scss'
})export class RegisterModalComponent {
  display: boolean = false;

  nom: string = '';
  prenom: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isAdmin: boolean = false;

  profilePictureFile: File | null = null;
  // @ts-ignore
  profilePicturePreviewUrl: string | undefined  = null;

  stepItems: MenuItem[];
  activeIndex: number = 0;

  errorMessage: string = '';

  createdUserId: string | null = null;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private authService: AuthServiceService
  ) {
    this.stepItems = [
      { label: 'Informations', command: (event: any) => this.activeIndex = 0 },
      { label: 'Photo de Profil', command: (event: any) => this.activeIndex = 1 },
      { label: 'Récapitulatif', command: (event: any) => this.activeIndex = 2 }
    ];
  }

  show(): void {
    this.resetForm();
    this.display = true;
  }

  hide(): void {
    this.display = false;
    this.resetForm();
  }

  resetForm(): void {
    this.nom = '';
    this.prenom = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.isAdmin = false;
    this.profilePictureFile = null;
    this.profilePicturePreviewUrl = undefined;
    this.activeIndex = 0;
    this.errorMessage = '';
    this.createdUserId = null;
  }

  nextStep(): void {
    if (this.activeIndex === 0) {
      if (!this.nom || !this.prenom || !this.email || !this.password || !this.confirmPassword) {
        this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
        this.messageService.add({ severity: 'warn', summary: 'Validation', detail: this.errorMessage });
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = "Les mots de passe ne correspondent pas.";
        this.messageService.add({ severity: 'warn', summary: 'Validation', detail: this.errorMessage });
        return;
      }
    }
    this.errorMessage = '';
    if (this.activeIndex < this.stepItems.length - 1) {
      this.activeIndex++;
    }
  }

  prevStep(): void {
    this.errorMessage = '';
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  onFileSelect(event: any): void {
    if (event.files && event.files.length > 0) {
      this.profilePictureFile = event.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicturePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(this.profilePictureFile as Blob);
    }
  }

  onFileRemove(): void {
    this.profilePictureFile = null;
    this.profilePicturePreviewUrl = undefined;
  }

  getAvatarLabel(): string {
    const prenomInitial = this.prenom ? this.prenom[0].toUpperCase() : '';
    const nomInitial = this.nom ? this.nom[0].toUpperCase() : '';
    return prenomInitial + nomInitial || '??';
  }

  async onSubmit(): Promise<void> {
    if (this.activeIndex !== 2) {
      this.messageService.add({ severity: 'warn', summary: 'Action requise', detail: 'Veuillez compléter toutes les étapes.'});
      return;
    }
    this.errorMessage = '';

    this.http.post<any>(`${environment.apiUrl}/register`, {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.password,
      isAdmin: this.isAdmin
    }).subscribe({
      next: async (response) => {
        this.createdUserId = response.userId;

        if (this.profilePictureFile && this.createdUserId) {
          await this.uploadProfilePicture(this.createdUserId, this.profilePictureFile);
        } else {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: response.message || "Utilisateur créé avec succès." });
          setTimeout(() => this.hide(), 2000);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error || "Erreur lors de la création du compte.";
        this.messageService.add({ severity: 'error', summary: 'Erreur Création', detail: this.errorMessage });
      }
    });
  }

  private async uploadProfilePicture(userId: string, file: File): Promise<void> {
    const formData: FormData = new FormData();
    formData.append('profilePic', file, file.name);

    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const uploadResponse = await this.http.post<any>(`${environment.apiUrl}/users/${userId}/profile-picture`, formData, { headers }).toPromise();
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Utilisateur créé et photo de profil mise à jour." });
      setTimeout(() => this.hide(), 2500);
    } catch (uploadError: any) {
      console.error("Erreur upload photo:", uploadError);
      this.messageService.add({ severity: 'warn', summary: 'Info Utilisateur', detail: "Utilisateur créé, mais échec de l'upload de la photo de profil. Vous pourrez la modifier plus tard." });
      setTimeout(() => this.hide(), 3000);
    }
  }
}
