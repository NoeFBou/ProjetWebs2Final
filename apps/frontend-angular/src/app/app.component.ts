import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CarouselComponent} from "./carousel/carousel.component";
import {AddAssignmentModalComponent} from "./add-assignment-modal/add-assignment-modal.component";
import {LoginComponentComponent} from "./login-component/login-component.component";
import {AuthServiceService} from "./auth-service.service";
import {CommonModule, NgClass, NgIf, NgStyle} from '@angular/common';
import {ButtonDirective} from "primeng/button";
import {SideNavigationComponent} from "./side-navigation/side-navigation.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet,
    CommonModule,
    RouterOutlet, LoginComponentComponent, NgIf, ButtonDirective, SideNavigationComponent, NgStyle, NgClass],
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

  sidebarCollapsed: boolean = false;

  onSidebarCollapseChange(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }
}


