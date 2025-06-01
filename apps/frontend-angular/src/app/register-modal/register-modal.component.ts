import { Component } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {NgIf} from "@angular/common";
import {Button, ButtonDirective} from "primeng/button";
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
    ButtonDirective,
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

  // Étape 1: Informations
  nom: string = '';
  prenom: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isAdmin: boolean = false;

  // Étape 2: Photo
  profilePictureFile: File | null = null;
  // @ts-ignore
  profilePicturePreviewUrl: string | undefined  = null;

  // Stepper
  stepItems: MenuItem[];
  activeIndex: number = 0;

  // Messages
  errorMessage: string = '';
  // successMessage: string = ''; // Sera géré par Toast

  // Utilisateur créé (pour l'upload de photo)
  createdUserId: string | null = null;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private authService: AuthServiceService // Pour obtenir le token si nécessaire pour l'upload
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
    if (this.activeIndex === 0) { // Validation avant de passer de l'étape 1 à 2
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
    // Si l'étape 2 (photo) est optionnelle, on pourrait permettre de sauter
    this.errorMessage = ''; // Clear error message
    if (this.activeIndex < this.stepItems.length - 1) {
      this.activeIndex++;
    }
  }

  prevStep(): void {
    this.errorMessage = ''; // Clear error message
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  // Gestion de la sélection de fichier pour p-fileUpload (mode basique pour aperçu)
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

  // Pour le p-avatar dans le récapitulatif
  getAvatarLabel(): string {
    const prenomInitial = this.prenom ? this.prenom[0].toUpperCase() : '';
    const nomInitial = this.nom ? this.nom[0].toUpperCase() : '';
    return prenomInitial + nomInitial || '??';
  }

  async onSubmit(): Promise<void> {
    if (this.activeIndex !== 2) { // S'assurer qu'on est à la dernière étape
      this.messageService.add({ severity: 'warn', summary: 'Action requise', detail: 'Veuillez compléter toutes les étapes.'});
      return;
    }
    this.errorMessage = '';

    // 1. Enregistrer les informations utilisateur
    this.http.post<any>(`${environment.apiUrl}/register`, {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.password,
      isAdmin: this.isAdmin
    }).subscribe({
      next: async (response) => {
        this.createdUserId = response.userId; // Récupérer l'ID de l'utilisateur créé

        // 2. Si une photo a été sélectionnée et l'utilisateur créé, uploader la photo
        if (this.profilePictureFile && this.createdUserId) {
          await this.uploadProfilePicture(this.createdUserId, this.profilePictureFile);
          // Le message de succès final sera affiché après la tentative d'upload
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

  // Méthode pour uploader la photo après création de l'utilisateur
  private async uploadProfilePicture(userId: string, file: File): Promise<void> {
    const formData: FormData = new FormData();
    formData.append('profilePic', file, file.name);

    const token = this.authService.getToken(); // Obtenir le token JWT pour l'authentification
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    // 'Content-Type' n'est pas nécessaire, le navigateur le définit pour FormData

    try {
      const uploadResponse = await this.http.post<any>(`${environment.apiUrl}/users/${userId}/profile-picture`, formData, { headers }).toPromise();
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Utilisateur créé et photo de profil mise à jour." });
      setTimeout(() => this.hide(), 2500);
    } catch (uploadError: any) {
      console.error("Erreur upload photo:", uploadError);
      this.messageService.add({ severity: 'warn', summary: 'Info Utilisateur', detail: "Utilisateur créé, mais échec de l'upload de la photo de profil. Vous pourrez la modifier plus tard." });
      setTimeout(() => this.hide(), 3000); // Fermer après un délai plus long pour lire le message
    }
  }
}
