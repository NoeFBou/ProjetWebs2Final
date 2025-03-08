import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {NgIf} from "@angular/common";
import {ButtonDirective} from "primeng/button";
import {CheckboxModule} from "primeng/checkbox";

@Component({
  selector: 'app-register-modal',
  imports: [
    FormsModule,
    DialogModule,
    NgIf,
    ButtonDirective,
    CheckboxModule
  ],
  templateUrl: './register-modal.component.html',
  standalone: true,
  styleUrl: './register-modal.component.scss'
})
export class RegisterModalComponent {
  display: boolean = false;
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isAdmin: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient) {}

  show(): void {
    this.display = true;
  }

  hide(): void {
    this.display = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.isAdmin = false;
  }

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Les mots de passe ne correspondent pas";
      return;
    }
    this.http.post<any>('http://localhost:5000/api/register', { email: this.email, password: this.password, isAdmin: this.isAdmin })
      .subscribe({
        next: () => {
          this.successMessage = "Utilisateur créé avec succès";
          setTimeout(() => this.hide(), 2000);
        },
        error: () => {
          this.errorMessage = "Erreur lors de la création du compte";
        }
      });
  }
}
