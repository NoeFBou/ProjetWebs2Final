import { Component } from '@angular/core';
import {AssignmentService} from "../assignment.service";
import {NgIf, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-import-assignment',
  imports: [
    NgIf,
    NgOptimizedImage
  ],
  templateUrl: './import-assignment.component.html',
  standalone: true,
  styleUrl: './import-assignment.component.scss'
})
export class ImportAssignmentComponent {
  isCollapsed: boolean = false;

  constructor(private assignmentService: AssignmentService) { }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          console.log("Fichier JSON importé :", jsonData);

          this.assignmentService.peuplerBD(jsonData).subscribe({
            next: (result) => {
              console.log("Base de données peuplée avec succès !", result);
              alert("La base de données a été mise à jour avec les données du fichier.");
            },
            error: (error) => {
              console.error("Erreur lors du peuplement de la base de données :", error);
              alert("Erreur lors de la mise à jour de la base de données.");
            }
          });
        } catch (error) {
          console.error("Erreur lors du parsing du JSON :", error);
          alert("Le fichier sélectionné n'est pas un JSON valide.");
        }
      };

      reader.readAsText(file);
    }
  }
}
