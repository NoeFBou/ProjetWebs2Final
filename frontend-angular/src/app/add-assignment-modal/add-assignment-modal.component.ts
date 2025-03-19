// add-assignment-modal.component.ts
import { Component } from '@angular/core';
import { Assignment, AssignmentService } from "../assignment.service";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-assignment-modal',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './add-assignment-modal.component.html',
  styleUrls: ['./add-assignment-modal.component.scss']
})
export class AddAssignmentModalComponent {
  assignment: Assignment = {
    name: '',
    date: new Date(),
    nombre: 0,
    department: '',
    termine: false
  };

  constructor(
    public activeModal: NgbActiveModal,
    private assignmentService: AssignmentService
  ) {}

  addAssignment() {
    // Conversion de la date
    if (this.assignment.date) {
      this.assignment.date = new Date(this.assignment.date);
    }
    // Conversion en nombre et vérification du booléen
    this.assignment.nombre = Number(this.assignment.nombre);
    this.assignment.termine = Boolean(this.assignment.termine);

    console.log("Assignment à envoyer :", this.assignment);

    this.assignmentService.addAssignment(this.assignment).subscribe({
      next: (data: Assignment) => {
        console.log("Assignment ajouté :", data);
        // Fermeture du modal
        this.activeModal.close();
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout", error);
      }
    });
  }
}
