import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {AddAssignmentModalComponent} from "../add-assignment-modal/add-assignment-modal.component";
import {AuthServiceService, DecodedToken} from "../auth-service.service";
import {NgbModal, NgbModalOptions} from "@ng-bootstrap/ng-bootstrap";
import {ButtonDirective} from "primeng/button";
import {NgClass, NgIf, NgOptimizedImage} from "@angular/common";
import {Assignment, AssignmentService} from "../assignment.service";
//import {ImportAssignmentComponent} from "../import-assignment/import-assignment.component";
import {RouterLink, RouterModule} from "@angular/router";
import {AvatarModule} from "primeng/avatar";
import {TooltipModule} from "primeng/tooltip";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-side-navigation',
  templateUrl: './side-navigation.component.html',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    RouterModule,
    AvatarModule,
    TooltipModule

  ],
  styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnInit {
  isCollapsed: boolean = false;
  currentUser: DecodedToken | null = null;
  userProfilePictureUrl: string | undefined = undefined;
  userFullName: string = '';
  userRole: string = '';
  serverBaseUrl = environment.serverBaseUrl || '';


  @Output() collapsedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    protected authService: AuthServiceService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.userFullName = `${this.currentUser.prenom} ${this.currentUser.nom}`;
      this.userRole = this.currentUser.isAdmin ? 'Professeur' : 'Élève';
      this.updateProfilePictureUrl();
    }
  }

  updateProfilePictureUrl(): void {
    if (this.currentUser && this.currentUser.profilePicture) {
      this.userProfilePictureUrl = `${this.serverBaseUrl}/uploads/profile-pictures/${this.currentUser.profilePicture}?t=${new Date().getTime()}`;
    } else {
      this.userProfilePictureUrl = undefined;
    }
  }

  getAvatarLabel(): string {
    if (this.currentUser) {
      const prenomInitial = this.currentUser.prenom ? this.currentUser.prenom[0].toUpperCase() : '';
      const nomInitial = this.currentUser.nom ? this.currentUser.nom[0].toUpperCase() : '';
      return prenomInitial + nomInitial || 'U';
    }
    return '??';
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  logout() {
    this.authService.logout();
  }

  openAddAssignmentModal() {
    this.modalService.open(AddAssignmentModalComponent, { size: 'xl', centered: true });
  }
}
