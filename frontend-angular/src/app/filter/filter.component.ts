import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterCriteria {
  stock_industry?: string;
  date?: string;      // Valeur issue d'un input type date (à convertir en Date si besoin)
  nombre?: number;    // Filtrage sur le champ nombre
  department?: string;
  termine?: boolean;  // Filtrage sur le champ booléen
}

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent {
  criteria: FilterCriteria = {};

  @Output() filterChange = new EventEmitter<FilterCriteria>();

  onFilterChange(): void {
    console.log(this.criteria);
    this.filterChange.emit({ ...this.criteria });
  }

  resetFilters(): void {
    this.criteria = {};
    this.onFilterChange();
  }
}
