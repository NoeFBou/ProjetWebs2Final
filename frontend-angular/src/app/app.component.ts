import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CarouselComponent} from "./carousel/carousel.component";
import {AddAssignmentModalComponent} from "./add-assignment-modal/add-assignment-modal.component";
import {LoginComponentComponent} from "./login-component/login-component.component";
import {AuthServiceService} from "./auth-service.service";
import {CommonModule, NgIf} from '@angular/common';
import {ButtonDirective} from "primeng/button";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CarouselComponent, AddAssignmentModalComponent, RouterOutlet, LoginComponentComponent, NgIf, ButtonDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend-angular';
  constructor(protected authService: AuthServiceService) { }

  isLoggedIn(): boolean {
    return this.authService.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.reload();
  }
}


