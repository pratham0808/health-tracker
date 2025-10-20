import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-tabs.component.html',
  styleUrl: './category-tabs.component.scss'
})
export class CategoryTabsComponent {
  categories = input.required<string[]>();
  selectedCategory = input.required<string>();
  categoryChange = output<string>();

  onSelect(category: string) {
    this.categoryChange.emit(category);
  }
}


