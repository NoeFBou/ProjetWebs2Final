import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import {Assignment, AssignmentService} from "../assignment.service";

export interface FilterCriteria {
  name?: string;
  date?: string;      // Valeur issue d'un input type date (à convertir en Date si besoin)
  nombre?: number;    // Filtrage sur le champ nombre
  department?: string;
  termine?: boolean;  // Filtrage sur le champ booléen
}



@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  criteria: FilterCriteria = {};

  names: string[] = [];
  departments: string[] = [];
  filteredNames: string[] = [];
  filteredDepartments: string[] = [];

  @Output() filterChange = new EventEmitter<FilterCriteria>();

  constructor(private assignmentService: AssignmentService) { }

  ngOnInit(): void {
    this.assignmentService.getAssignments().subscribe((assignments: Assignment[]) => {
      this.names = assignments.map(a => a.name);
      this.names = [...new Set(this.names)];
      this.departments = assignments.map(a => a.department);
      this.departments = [...new Set(this.departments)];
    });
  }

  onFilterChange(): void {
    //console.log(this.criteria);
    this.filterChange.emit({ ...this.criteria });
  }

  resetFilters(): void {
    this.criteria = {};
    this.onFilterChange();
  }

  filterNames(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.filteredNames = this.names.filter(name => name.toLowerCase().includes(query));
  }

  filterDepartments(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.filteredDepartments = this.departments.filter(department => department.toLowerCase().includes(query));
  }
}
