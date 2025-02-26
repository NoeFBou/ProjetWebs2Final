import { Component } from '@angular/core';
import {Assignment, AssignmentService} from "../assignment.service";
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-assignment-modal',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './add-assignment-modal.component.html',
  styleUrl: './add-assignment-modal.component.scss'
})
export class AddAssignmentModalComponent {
  assignment: Assignment = {
    id: 0,
    stock_industry: '',
    stock_sector: '',
    stock_market_cap: '',
    department: '',
    address: ''
  };

  constructor(private modalService: NgbModal, private assignmentService: AssignmentService) {}

  open(content: any) {
    this.modalService.open(content);
  }
  addAssignment(modal: any) {
    this.assignmentService.addAssignment(this.assignment).subscribe({
      next: (data: Assignment) => {
        console.log("Assignment ajouté :", data);
        modal.close();
        // Optionnel : émettre un événement pour rafraîchir le carousel
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout", error);
      }
    });
  }

}
