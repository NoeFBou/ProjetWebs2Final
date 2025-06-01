import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LoginComponentComponent} from "./login-component/login-component.component";
import {AuthServiceService} from "./auth-service.service";
import {CommonModule, NgIf, NgStyle} from '@angular/common';
import {SideNavigationComponent} from "./side-navigation/side-navigation.component";
import {ToastModule} from "primeng/toast";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    CommonModule,
    RouterOutlet, LoginComponentComponent, NgIf,  SideNavigationComponent, NgStyle,  ToastModule],
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


