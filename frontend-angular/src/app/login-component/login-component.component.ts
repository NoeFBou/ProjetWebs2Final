import { Component } from '@angular/core';
import {AuthServiceService} from "../auth-service.service";
import {FormsModule} from "@angular/forms";
@Component({
  selector: 'app-login-component',
  imports: [
    FormsModule
  ],
  templateUrl: './login-component.component.html',
  standalone: true,
  styleUrl: './login-component.component.scss'
})
export class LoginComponentComponent {
  email= '';
  password= '';
  errorMessage= '';

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


}
