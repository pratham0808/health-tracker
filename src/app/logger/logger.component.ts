import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryTabsComponent } from '../stats/category-tabs/category-tabs.component';
import { ApiService, Log, ExerciseGroupsDoc } from '../services/api.service';
import moment from 'moment';

@Component({
  selector: 'app-logger',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryTabsComponent],
  templateUrl: './logger.component.html',
  styleUrl: './logger.component.scss'
})
export class LoggerComponent {
  exerciseGroups = signal<ExerciseGroupsDoc | null>(null);
  selectedCategoryId = signal('');
  selectedDate = signal(this.getTodayDate());
  logs = signal<Log[]>([]);
  selectedExerciseId = '';

  categories = computed(() => {
    return this.exerciseGroups()?.categories.map(cat => ({
      id: cat._id!,
      name: cat.categoryName
    })) ?? [];
  });

  logsForDate = computed(() => {
    return this.logs();
  });

  availableExercises = computed(() => {
    if (!this.selectedCategoryId()) return [];
    
    const loggedExerciseIds = this.logsForDate().map(log => log.exerciseId);
    const category = this.exerciseGroups()?.categories.find(cat => cat._id === this.selectedCategoryId());
    if (!category) return [];
    
    return category.exercises.filter(ex => 
      ex.exerciseName && 
      ex.exerciseName.trim() && 
      ex._id && 
      !loggedExerciseIds.includes(ex._id)
    );
  });

  constructor(private apiService: ApiService) {
    this.loadExerciseGroups();
  }

  selectCategory(categoryId: string) {
    this.selectedCategoryId.set(categoryId);
    this.loadLogs();
  }

  dateChanged() {
    this.loadLogs();
  }

  onExerciseSelected() {
    if (!this.selectedExerciseId) return;
    
    const category = this.exerciseGroups()?.categories.find(cat => cat._id === this.selectedCategoryId());
    const exercise = category?.exercises.find(ex => ex._id === this.selectedExerciseId);
    
    if (!exercise || !category) return;
    
    const newLog: Log = {
      exerciseId: exercise._id!,
      categoryId: category._id!,
      exerciseName: exercise.exerciseName,
      category: category.categoryName,
      date: this.selectedDate(),
      reps: 0,
      count: 0
    };
  
    this.apiService.createLog(newLog).subscribe({
      next: (log) => {
        this.logs.update(logs => [...logs, log]);
        this.selectedExerciseId = '';
      },
      error: (err: any) => console.error('Failed to create log:', err)
    });
  }

  updateReps(logId: string, value: number) {
    this.apiService.updateLog(logId, { reps: value }).subscribe({
      next: (updatedLog: Log) => {
        this.logs.update(logs => logs.map(log => log._id === logId ? updatedLog : log));
      },
      error: (err: any) => console.error('Failed to update reps:', err)
    });
  }

  updateCount(logId: string, value: number) {
    this.apiService.updateLog(logId, { count: value }).subscribe({
      next: (updatedLog: Log) => {
        this.logs.update(logs => logs.map(log => log._id === logId ? updatedLog : log));
      },
      error: (err: any) => console.error('Failed to update count:', err)
    });
  }

  deleteLog(logId: string) {
    this.apiService.deleteLog(logId).subscribe({
      next: () => {
        this.logs.update(logs => logs.filter(log => log._id !== logId));
      },
      error: (err: any) => console.error('Failed to delete log:', err)
    });
  }

  getTodayDate(): string {
    return moment().format('YYYY-MM-DD');
  }

  private loadExerciseGroups() {
    this.apiService.getExerciseGroups().subscribe({
      next: (groups) => {
        this.exerciseGroups.set(groups);
        if (groups && groups.categories.length > 0 && !this.selectedCategoryId()) {
          this.selectedCategoryId.set(groups.categories[0]._id!);
          // Load logs after setting the first category
          this.loadLogs();
        }
      },
      error: (err) => console.error('Failed to load exercise groups:', err)
    });
  }

  private loadLogs() {
    this.apiService.getLogs(this.selectedDate(), this.selectedCategoryId()).subscribe({
      next: (logs: Log[]) => {
        this.logs.set(logs);
      },
      error: (err: any) => console.error('Failed to load logs:', err)
    });
  }
}
