import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {AddAssignmentModalComponent} from "../add-assignment-modal/add-assignment-modal.component";
import {AuthServiceService} from "../auth-service.service";
import {NgbModal, NgbModalOptions} from "@ng-bootstrap/ng-bootstrap";
import {ButtonDirective} from "primeng/button";
import {NgClass, NgIf, NgOptimizedImage} from "@angular/common";
import {Assignment, AssignmentService} from "../assignment.service";
//import {ImportAssignmentComponent} from "../import-assignment/import-assignment.component";
import {RouterLink, RouterModule} from "@angular/router";

@Component({
  selector: 'app-side-navigation',
  templateUrl: './side-navigation.component.html',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    RouterModule ,
    NgOptimizedImage

  ],
  styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnInit {
  isCollapsed: boolean = false;
  assignments: Assignment[] = [];

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
    const modalOptions: NgbModalOptions = {
      size: 'xl', // 'lg' for large, 'xl' for extra large
      centered: true,
    };
    this.modalService.open(AddAssignmentModalComponent, modalOptions);
  }
}
