import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryTabsComponent } from '../stats/category-tabs/category-tabs.component';
import { ApiService, Exercise, Log } from '../services/api.service';
import moment from 'moment';

@Component({
  selector: 'app-logger',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryTabsComponent],
  templateUrl: './logger.component.html',
  styleUrl: './logger.component.scss'
})
export class LoggerComponent {
  categories = ['arms', 'core', 'thighs', 'back'];
  selectedCategory = signal('arms');
  selectedDate = signal(this.getTodayDate());
  exercises = signal<Exercise[]>([]);
  logs = signal<Log[]>([]);
  selectedExerciseId = '';

  logsForDate = computed(() => {
    return this.logs().filter(log => {
      const logDate = moment(log.date).format('YYYY-MM-DD');
      return logDate === this.selectedDate() && 
             log.category === this.selectedCategory();
    });
  });

  availableExercises = computed(() => {
    const loggedExerciseIds = this.logsForDate().map(log => log.exerciseId);
    return this.exercises().filter(ex => 
      ex.category === this.selectedCategory() && 
      !loggedExerciseIds.includes(ex._id!)
    );
  });

  constructor(private apiService: ApiService) {
    this.loadExercises();
    this.loadLogs();
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.loadLogs();
  }

  dateChanged() {
    this.loadLogs();
  }

  onExerciseSelected() {
    if (!this.selectedExerciseId) return;
    
    const exercise = this.exercises().find(ex => ex._id === this.selectedExerciseId);
    if (exercise) {
        const newLog: Log = {
          exerciseId: exercise._id!,
          exerciseName: exercise.name,
          category: exercise.category,
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

  private loadExercises() {
    this.apiService.getExercises().subscribe({
      next: (exercises: Exercise[]) => {
        this.exercises.set(exercises);
      },
      error: (err: any) => console.error('Failed to load exercises:', err)
    });
  }

  private loadLogs() {
    this.apiService.getLogs(this.selectedDate()).subscribe({
      next: (logs: Log[]) => {
        this.logs.set(logs);
      },
      error: (err: any) => console.error('Failed to load logs:', err)
    });
  }
}
