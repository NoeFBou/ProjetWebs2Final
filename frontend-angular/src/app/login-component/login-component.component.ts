import {Component, ViewChild} from '@angular/core';
import {AuthServiceService} from "../auth-service.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {RegisterModalComponent} from "../register-modal/register-modal.component";
import {ButtonDirective} from "primeng/button";
@Component({
  selector: 'app-login-component',
  imports: [
    FormsModule,
    NgIf,
    RegisterModalComponent,
    ButtonDirective
  ],
  templateUrl: './login-component.component.html',
  standalone: true,
  styleUrl: './login-component.component.scss'
})
export class LoginComponentComponent {
  email= '';
  password= '';
  errorMessage= '';
  @ViewChild(RegisterModalComponent) registerModal!: RegisterModalComponent;

  constructor(private authService: AuthServiceService) { }

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (data) => {
        this.authService.setToken(data.token);
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la connexion';
  }})};

  openRegisterModal(): void {
    if (this.registerModal) {
      this.registerModal.show();
    }
  }


}
