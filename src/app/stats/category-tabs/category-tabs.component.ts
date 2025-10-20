import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-category-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-tabs.component.html',
  styleUrl: './category-tabs.component.scss'
})
export class CategoryTabsComponent {
  categories = input.required<Category[]>();
  selectedCategory = input.required<string>();
  categoryChange = output<string>();

  onSelect(categoryId: string) {
    this.categoryChange.emit(categoryId);
  }
}


