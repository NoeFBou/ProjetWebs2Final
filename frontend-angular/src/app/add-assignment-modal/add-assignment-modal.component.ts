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
    stock_industry: '',
    date: new Date(),
    nombre: 0,
    department: '',
    termine: false
  };

  constructor(private modalService: NgbModal, private assignmentService: AssignmentService) {}

  open(content: any) {
    // Réinitialisation de l'objet assignment à chaque ouverture
    this.assignment = {
      stock_industry: '',
      date: new Date(),      // On peut initialiser à null pour forcer la saisie de l'utilisateur
      nombre: 0,    // Même principe pour le nombre
      department: '',
      termine: false
    };
    this.modalService.open(content);
  }

  addAssignment(modal: any) {
    // Conversion de la date si une valeur est renseignée
    console.log(this.assignment);
    if (this.assignment.date) {
      this.assignment.date = new Date(this.assignment.date);
    }
    // Conversion en nombre
    this.assignment.nombre = Number(this.assignment.nombre);
    // La checkbox retourne déjà un booléen, mais on peut s'assurer que c'est bien le cas
    this.assignment.termine = Boolean(this.assignment.termine);

    // Pour vérifier dans la console que l'objet a bien les valeurs saisies par l'utilisateur
    console.log("Assignment à envoyer :", this.assignment);

    this.assignmentService.addAssignment(this.assignment).subscribe({
      next: (data: Assignment) => {
        console.log("Assignment ajouté :", data);
        modal.close();
        // Optionnel : émettre un événement pour rafraîchir la liste/affichage
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout", error);
      }
    });
  }

}
