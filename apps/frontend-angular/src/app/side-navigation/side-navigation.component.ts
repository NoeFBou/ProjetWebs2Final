import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {AddAssignmentModalComponent} from "../add-assignment-modal/add-assignment-modal.component";
import {AuthServiceService} from "../auth-service.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ButtonDirective} from "primeng/button";
import {NgClass, NgIf, NgOptimizedImage} from "@angular/common";
import {Assignment, AssignmentService} from "../assignment.service";
import {ImportAssignmentComponent} from "../import-assignment/import-assignment.component";
import {RouterLink, RouterModule} from "@angular/router";

@Component({
  selector: 'app-side-navigation',
  templateUrl: './side-navigation.component.html',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    RouterModule ,
    NgOptimizedImage,
    ImportAssignmentComponent
  ],
  styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnInit {
  isCollapsed: boolean = false;
  assignments: Assignment[] = [];

  // Émission de l'état vers le composant parent
  @Output() collapsedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(protected authService: AuthServiceService, private modalService: NgbModal,private assignmentService: AssignmentService) {}


  ngOnInit(): void { }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  logout() {
    this.authService.logout();
  }

  openAddAssignmentModal() {
    this.modalService.open(AddAssignmentModalComponent, { centered: true });
  }
}
