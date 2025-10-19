import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ExerciseStats, OverallStats } from '../services/api.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {
  categories = ['arms', 'core', 'thighs', 'back'];
  selectedCategory = signal('arms');
  
  dateRanges = [
    { label: '7 Days', value: 7 },
    { label: '15 Days', value: 15 },
    { label: '1 Month', value: 30 },
    { label: '6 Months', value: 180 }
  ];
  selectedDays = signal(7);
  
  exercises = signal<ExerciseStats[]>([]);
  overall = signal<OverallStats | null>(null);

  constructor(private apiService: ApiService) {
    this.loadStats();
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.loadStats();
  }

  selectDateRange(days: number) {
    this.selectedDays.set(days);
    this.loadStats();
  }

  getChangeClass(current: number, expected: number): string {
    if (current > expected) return 'positive';
    if (current < expected) return 'negative';
    return 'neutral';
  }

  getChangeIcon(current: number, expected: number): string {
    if (current > expected) return '↗';
    if (current < expected) return '↘';
    return '→';
  }

  getChangePercent(current: number, expected: number): number {
    if (expected === 0) return 0;
    return Math.round(((current - expected) / expected) * 100);
  }

  getProgressPercent(current: number, expected: number): number {
    if (expected === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.min(150, Math.round((current / expected) * 100)); // Cap at 150%
  }
  
  getProgressColor(current: number, expected: number): string {
    const percent = this.getChangePercent(current, expected);
    if (percent > 20) return '#51cf66'; // Bright green for big gains
    if (percent > 0) return '#94d82d'; // Light green for small gains
    if (percent === 0) return '#f4a261'; // Orange for same
    if (percent > -20) return '#ffa94d'; // Light orange for small loss
    return '#ff6b6b'; // Red for bigger loss
  }

  private loadStats() {
    this.apiService.getStats(this.selectedDays(), this.selectedCategory()).subscribe({
      next: (response) => {
        this.exercises.set(response.exercises);
        this.overall.set(response.overall);
      },
      error: (err: any) => console.error('Failed to load stats:', err)
    });
  }
}

