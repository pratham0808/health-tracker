import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService, ExerciseGroupsDoc } from '../services/api.service';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.scss'
})
export class ExercisesComponent {
  // Using new Exercise Groups API
  groups = signal<ExerciseGroupsDoc | null>(null);
  selectedCategory = signal('');
  newExerciseName = signal('');
  newCategoryName = signal('');
  newExerciseNames: Record<string, string> = {};
  isSaving = signal(false);

  constructor(private apiService: ApiService, private toastr: ToastrService) {
    this.loadGroups();
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  getCategories(): string[] {
    return this.groups()?.categories.map(c => c.categoryName) ?? [];
  }

  getExercisesByCategory(category: string): { exerciseName: string }[] {
    const cat = this.groups()?.categories.find(c => c.categoryName === category);
    return cat ? cat.exercises : [];
  }

  addNewCategoryCard() {
    const current = this.groups();
    const categories = current?.categories ?? [];
    const newCategoryName = `New Group ${categories.length + 1}`;
    
    // Add new category with one empty exercise
    categories.push({ 
      categoryName: newCategoryName, 
      exercises: [{ exerciseName: '' }] 
    });
    
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories });
    
    if (!this.selectedCategory()) {
      this.selectedCategory.set(newCategoryName);
    }
  }

  updateCategoryName(oldName: string, newName: string) {
    const current = this.groups();
    const categories = (current?.categories ?? []).map(c =>
      c.categoryName === oldName ? { ...c, categoryName: newName } : c
    );
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories });
    
    // Update selected category if it was the one being renamed
    if (this.selectedCategory() === oldName) {
      this.selectedCategory.set(newName);
    }
  }

  addExercise() {
    const name = this.newExerciseName().trim();
    const category = this.selectedCategory();
    if (!name || !category) return;
    const current = this.groups();
    const categories = (current?.categories ?? []).map(c =>
      c.categoryName === category ? { ...c, exercises: [...c.exercises, { exerciseName: name }] } : c
    );
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories });
    this.newExerciseName.set('');
  }

  deleteExercise(name: string) {
    const category = this.selectedCategory();
    if (!category) return;
    const current = this.groups();
    const categories = (current?.categories ?? []).map(c =>
      c.categoryName === category ? { ...c, exercises: c.exercises.filter(e => e.exerciseName !== name) } : c
    );
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories });
  }

  addExerciseToCategory(category: string) {
    const current = this.groups();
    const categories = (current?.categories ?? []).map(c =>
      c.categoryName === category ? { ...c, exercises: [...c.exercises, { exerciseName: '' }] } : c
    );
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories });
  }

  updateExerciseName(category: string, oldName: string, newName: string) {
    const current = this.groups();
    const categories = (current?.categories ?? []).map(c =>
      c.categoryName === category 
        ? { 
            ...c, 
            exercises: c.exercises.map(ex => 
              ex.exerciseName === oldName ? { ...ex, exerciseName: newName } : ex
            )
          }
        : c
    );
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories });
  }

  updateExerciseNameByIndex(category: string, index: number, newName: string) {
    const current = this.groups();
    const categories = (current?.categories ?? []).map(c =>
      c.categoryName === category 
        ? { 
            ...c, 
            exercises: c.exercises.map((ex, i) => 
              i === index ? { ...ex, exerciseName: newName } : ex
            )
          }
        : c
    );
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories });
  }

  deleteExerciseFromCategory(category: string, exerciseName: string) {
    const current = this.groups();
    const categories = (current?.categories ?? []).map(c =>
      c.categoryName === category ? { ...c, exercises: c.exercises.filter(e => e.exerciseName !== exerciseName) } : c
    );
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories });
  }

  deleteExerciseFromCategoryByIndex(category: string, index: number) {
    const current = this.groups();
    const categories = (current?.categories ?? []).map(c =>
      c.categoryName === category ? { ...c, exercises: c.exercises.filter((e, i) => i !== index) } : c
    );
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories });
  }

  deleteCategory(category: string) {
    const current = this.groups();
    const categories = (current?.categories ?? []).filter(c => c.categoryName !== category);
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories });
    if (this.selectedCategory() === category) {
      this.selectedCategory.set(categories[0]?.categoryName ?? '');
    }
  }

  private loadGroups() {
    this.apiService.getExerciseGroups().subscribe({
      next: (doc) => {
        this.groups.set(doc);
        if (doc && doc.categories.length > 0 && !this.selectedCategory()) {
          this.selectedCategory.set(doc.categories[0].categoryName);
        }
      },
      error: (err) => console.error('Failed to load exercise groups:', err)
    });
  }

  saveAll() {
    const current = this.groups();
    const payload: ExerciseGroupsDoc = { categories: current?.categories ?? [] };
    
    this.isSaving.set(true);
    
    this.apiService.upsertExerciseGroups(payload).subscribe({
      next: (updated) => {
        this.groups.set(updated);
        this.isSaving.set(false);
        this.toastr.success('Exercise groups saved successfully!', 'Success', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      },
      error: (err) => {
        console.error('Failed to save exercise groups:', err);
        this.isSaving.set(false);
        this.toastr.error('Failed to save exercise groups. Please try again.', 'Error', {
          timeOut: 5000,
          progressBar: true,
          closeButton: true
        });
      }
    });
  }

  trackByIndex(index: number): number {
    return index;
  }
}

