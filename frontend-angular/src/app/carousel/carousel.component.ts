import {Component, OnInit} from '@angular/core';
import {Assignment, AssignmentService} from "../assignment.service";
import { CommonModule } from '@angular/common';
import {NgbCarouselModule} from "@ng-bootstrap/ng-bootstrap";
import { CarouselModule } from 'primeng/carousel';
import {TagModule} from "primeng/tag";
import {Button} from "primeng/button";

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, NgbCarouselModule, CarouselModule, TagModule, Button],

  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
  assignments: Assignment[] = [];
  responsiveOptions: any[] | undefined;

  constructor(private assignmentService: AssignmentService) { }

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
        },
        error : (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      });
    }
  }

}
