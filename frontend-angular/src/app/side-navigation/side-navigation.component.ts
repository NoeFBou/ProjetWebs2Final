import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {AddAssignmentModalComponent} from "../add-assignment-modal/add-assignment-modal.component";
import {AuthServiceService} from "../auth-service.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ButtonDirective} from "primeng/button";
import {NgClass, NgIf, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-side-navigation',
  templateUrl: './side-navigation.component.html',
  standalone: true,
  imports: [
    ButtonDirective,
    NgIf,
    NgClass,
    NgOptimizedImage
  ],
  styleUrls: ['./side-navigation.component.scss']
})
export class SideNavigationComponent implements OnInit {
  isCollapsed: boolean = false;

  // Émission de l'état vers le composant parent
  @Output() collapsedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(protected authService: AuthServiceService, private modalService: NgbModal) {}


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
