import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DateRange {
  label: string;
  value: number;
}

@Component({
  selector: 'app-date-range-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-range-dropdown.component.html',
  styleUrl: './date-range-dropdown.component.scss'
})
export class DateRangeDropdownComponent {
  dateRanges = input.required<DateRange[]>();
  selectedDays = input.required<number>();
  dateRangeChange = output<number>();

  isOpen = false;

  onSelect(days: number) {
    this.dateRangeChange.emit(days);
    this.isOpen = false;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  getSelectedLabel(): string {
    const selected = this.dateRanges().find(range => range.value === this.selectedDays());
    return selected ? selected.label : 'Select Period';
  }
}
