import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterCriteria {
  stock_industry?: string;
  stock_sector?: string;
  stock_market_cap?: string;
  department?: string;
  address?: string;
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
    // Émission d'un clone pour éviter les problèmes liés à la référence

    //print the filter criteria
    console.log(this.criteria);


    this.filterChange.emit({ ...this.criteria });
  }

  resetFilters(): void {
    this.criteria = {};
    this.onFilterChange();
  }
}
