import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Exercise } from '../services/api.service';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.scss'
})
export class ExercisesComponent {
  categories = ['arms', 'core', 'thighs', 'back'];
  selectedCategory = signal('arms');
  exercises = signal<Exercise[]>([]);
  newExerciseName = signal('');

  constructor(private apiService: ApiService) {
    this.loadExercises();
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  getExercisesByCategory(category: string): Exercise[] {
    return this.exercises().filter(ex => ex.category === category);
  }

  addExercise() {
    const name = this.newExerciseName().trim();
    if (!name) return;

    this.apiService.createExercise(name, this.selectedCategory()).subscribe({
      next: (exercise) => {
        this.exercises.update(exs => [...exs, exercise]);
        this.newExerciseName.set('');
      },
      error: (err) => console.error('Failed to create exercise:', err)
    });
  }

  deleteExercise(id: string) {
    this.apiService.deleteExercise(id).subscribe({
      next: () => {
        this.exercises.update(exs => exs.filter(ex => ex._id !== id));
      },
      error: (err) => console.error('Failed to delete exercise:', err)
    });
  }

  private loadExercises() {
    this.apiService.getExercises().subscribe({
      next: (exercises) => {
        this.exercises.set(exercises);
      },
      error: (err) => console.error('Failed to load exercises:', err)
    });
  }
}

