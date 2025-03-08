import {Component, OnInit, ViewChild} from '@angular/core';
import {Assignment, AssignmentService} from "../assignment.service";
import { CommonModule } from '@angular/common';
import {NgbCarouselModule} from "@ng-bootstrap/ng-bootstrap";
import { CarouselModule } from 'primeng/carousel';
import {TagModule} from "primeng/tag";
import {Button, ButtonDirective} from "primeng/button";
import {FilterComponent, FilterCriteria} from "../filter/filter.component";
import {AuthServiceService} from "../auth-service.service";
import {EditAssignmentModalComponent} from "../edit-assignment-modal/edit-assignment-modal.component";

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, NgbCarouselModule, CarouselModule, TagModule, Button, FilterComponent, EditAssignmentModalComponent, ButtonDirective],

  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
  assignments: Assignment[] = [];
  responsiveOptions: any[] | undefined;
  filteredAssignments: Assignment[] = [];

  @ViewChild('editModal', { static: true }) editModal!: EditAssignmentModalComponent;

  constructor(
    private assignmentService: AssignmentService,
    public authService: AuthServiceService
  ) { }
  ngOnInit(): void {
    this.loadAssignments();

    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
      }
    ];
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
          this.assignments = this.assignments.filter(a => a.id !== id);
          this.applyFilter({});
          },
        error : (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      });
    }
  }

  applyFilter(criteria: FilterCriteria): void {
    console.log("test",criteria);
    this.filteredAssignments = this.assignments.filter(item => {
      return (!criteria.stock_industry || item.stock_industry.toLowerCase().includes(criteria.stock_industry.toLowerCase()))
        && (!criteria.stock_sector || item.stock_sector.toLowerCase().includes(criteria.stock_sector.toLowerCase()))
        && (!criteria.stock_market_cap || item.stock_market_cap.toLowerCase().includes(criteria.stock_market_cap.toLowerCase()))
        && (!criteria.department || item.department.toLowerCase().includes(criteria.department.toLowerCase()))
        && (!criteria.address || item.address.toLowerCase().includes(criteria.address.toLowerCase()));
    });

  }

  openEditModal(assignment: Assignment): void {
    console.log("test",assignment);
    if (this.authService.isAdmin()) {
      console.log("testad",assignment);
      this.editModal.assignment = assignment;
      this.editModal.show();
    }
  }

  // Mise à jour de la liste quand l'assignment est édité
  onAssignmentUpdated(updatedAssignment: Assignment): void {
    const index = this.assignments.findIndex(a => a.id === updatedAssignment.id);
    if (index !== -1) {
      this.assignments[index] = updatedAssignment;
      this.applyFilter({});
    }
  }
}
