import {Component, OnInit} from '@angular/core';
import {Assignment, AssignmentService} from "../assignment.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit {
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  filterText: string = '';

  constructor(private assignmentService: AssignmentService) { }

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.assignmentService.getAssignments().subscribe({
      next: (data: Assignment[]) => {
        this.assignments = data;
        this.filteredAssignments = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des assignments', error);
      }
    });
  }

  deleteAssignment(id: number): void {
    if(confirm("Voulez-vous vraiment supprimer cet assignment ?")){
      this.assignmentService.deleteAssignment(id).subscribe({
        next :()=>{
          // Mise à jour de la liste après suppression
          this.assignments = this.assignments.filter(a => a.id !== id);
          this.applyFilter();
        },
        error : (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      });
    }
  }

  applyFilter(): void {
    if (this.filterText) {
      this.filteredAssignments = this.assignments.filter(a =>
        a.stock_industry.toLowerCase().includes(this.filterText.toLowerCase()) ||
        a.stock_sector.toLowerCase().includes(this.filterText.toLowerCase()) ||
        a.department.toLowerCase().includes(this.filterText.toLowerCase())
      );
    } else {
      this.filteredAssignments = this.assignments;
    }
  }

}
