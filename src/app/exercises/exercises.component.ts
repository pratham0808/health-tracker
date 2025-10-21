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
  
  // AI Mode
  showAIMode = signal(false);
  aiInput = signal('');
  isGeneratingAI = signal(false);
  aiSummary = signal('');

  constructor(private apiService: ApiService, private toastr: ToastrService) {
    this.loadGroups();
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  getCategories(): string[] {
    return this.groups()?.categories.map(c => c.categoryName) ?? [];
  }

  getExercisesByCategory(category: string): { exerciseName: string; description: string }[] {
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
      exercises: [{ exerciseName: '', description: '' }] 
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
    const description = this.getExerciseDescription(name);
    const categories = (current?.categories ?? []).map(c =>
      c.categoryName === category ? { ...c, exercises: [...c.exercises, { exerciseName: name, description }] } : c
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
      c.categoryName === category ? { ...c, exercises: [...c.exercises, { exerciseName: '', description: '' }] } : c
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
    const description = this.getExerciseDescription(newName);
    const categories = (current?.categories ?? []).map(c =>
      c.categoryName === category 
        ? { 
            ...c, 
            exercises: c.exercises.map((ex, i) => 
              i === index ? { ...ex, exerciseName: newName, description } : ex
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

  // AI Mode Methods
  toggleAIMode() {
    this.showAIMode.update(val => !val);
    if (!this.showAIMode()) {
      this.aiInput.set('');
      this.aiSummary.set('');
    }
  }

  clearAISummary() {
    this.aiSummary.set('');
  }

  generateAISuggestions() {
    const input = this.aiInput().trim();
    if (!input) {
      this.toastr.warning('Please enter your fitness goals or requirements', 'Input Required');
      return;
    }

    this.isGeneratingAI.set(true);
    
    // Pass existing groups to AI for context
    const existingGroups = this.groups() || undefined;
    
    this.apiService.getAISuggestions(input, existingGroups).subscribe({
      next: (aiSuggestions) => {
        this.mergeAISuggestions(aiSuggestions);
        
        // Auto-save the changes after AI suggestions are applied
        this.autoSaveAfterAI();
        
        this.isGeneratingAI.set(false);
        this.toastr.success('AI suggestions applied and saved!', 'Success', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
        this.aiInput.set('');
        this.showAIMode.set(false);
      },
      error: (err) => {
        console.error('Failed to get AI suggestions:', err);
        this.isGeneratingAI.set(false);
        this.toastr.error('Failed to get AI suggestions. Please try again.', 'Errror', {
          timeOut: 5000,
          progressBar: true,
          closeButton: true
        });
      }
    });
  }

  private mergeAISuggestions(aiSuggestions: ExerciseGroupsDoc) {
    const current = this.groups();
    const existingCategories = current?.categories ?? [];
    const newCategories = aiSuggestions.categories ?? [];
    
    // Use AI-generated summary if available, otherwise generate our own
    if (aiSuggestions.summary) {
      this.aiSummary.set(aiSuggestions.summary);
    } else {
      this.generateAISummary(newCategories);
    }
    
    // If AI returns empty categories, it means "remove everything" or "start fresh"
    if (newCategories.length === 0) {
      this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories: [] });
      this.selectedCategory.set('');
      return;
    }
    
    // For AI suggestions, use the AI response as the new structure
    // This ensures that modifications like "remove arms" actually remove them
    this.groups.set({ ...(current ?? {} as ExerciseGroupsDoc), categories: newCategories });
    
    // Select the first category if none is selected
    if (!this.selectedCategory() && newCategories.length > 0) {
      this.selectedCategory.set(newCategories[0].categoryName);
    }
  }

  private generateAISummary(categories: any[]) {
    if (!categories || categories.length === 0) {
      this.aiSummary.set('AI has cleared all exercise groups.');
      return;
    }

    const totalExercises = categories.reduce((sum, cat) => sum + cat.exercises.length, 0);
    const categoryNames = categories.map(cat => cat.categoryName).join(', ');
    
    this.aiSummary.set(`AI designed ${categories.length} exercise group${categories.length > 1 ? 's' : ''} (${categoryNames}) with ${totalExercises} total exercises. Each exercise includes detailed instructions for proper form and technique.`);
  }

  private autoSaveAfterAI() {
    const current = this.groups();
    const payload: ExerciseGroupsDoc = { categories: current?.categories ?? [] };
    
    this.apiService.upsertExerciseGroups(payload).subscribe({
      next: (updated) => {
        this.groups.set(updated);
        console.log('AI changes auto-saved successfully');
      },
      error: (err) => {
        console.error('Failed to auto-save AI changes:', err);
        this.toastr.warning('AI changes applied but failed to save. Please save manually.', 'Warning', {
          timeOut: 5000,
          progressBar: true,
          closeButton: true
        });
      }
    });
  }

  private getExerciseDescription(exerciseName: string): string {
    const descriptions: { [key: string]: string } = {
      'Push-ups': 'Start in plank position, lower chest to ground, push back up. Keep core tight and body straight.',
      'Pull-ups': 'Hang from bar, pull body up until chin clears bar, lower with control. Engage back muscles.',
      'Squats': 'Stand with feet shoulder-width apart, lower hips back and down, drive through heels to stand.',
      'Lunges': 'Step forward, lower back knee toward ground, push back to starting position. Alternate legs.',
      'Plank': 'Hold straight line from head to heels, engage core, breathe normally. Avoid sagging hips.',
      'Burpees': 'Squat down, jump feet back to plank, do push-up, jump feet forward, jump up with arms overhead.',
      'Mountain Climbers': 'Start in plank, alternate bringing knees to chest quickly. Keep core engaged.',
      'Jumping Jacks': 'Jump feet apart while raising arms overhead, jump back together. Maintain steady rhythm.',
      'Deadlifts': 'Stand with feet hip-width apart, hinge at hips, lower weight along legs, drive hips forward.',
      'Bench Press': 'Lie on bench, lower bar to chest, press up explosively. Keep core tight and feet flat.',
      'Overhead Press': 'Stand tall, press weight from shoulders to overhead, lower with control. Engage core.',
      'Rows': 'Hinge at hips, pull weight to lower chest, squeeze shoulder blades together. Control the weight.',
      'Bicep Curls': 'Stand tall, curl weight up by flexing biceps, lower with control. Keep elbows at sides.',
      'Tricep Dips': 'Sit on edge of surface, lower body by bending elbows, push back up. Keep shoulders down.',
      'Calf Raises': 'Stand on edge of step, rise up on toes, lower below step level. Control the movement.',
      'Leg Press': 'Sit in machine, press weight away with legs, control return. Keep knees aligned with toes.',
      'Lat Pulldowns': 'Pull bar to upper chest, squeeze shoulder blades, control return. Keep chest up.',
      'Shoulder Press': 'Press weights from shoulders to overhead, lower with control. Keep core engaged.',
      'Chest Flyes': 'Lie on bench, lower weights in arc motion, bring together over chest. Control the stretch.',
      'Lateral Raises': 'Raise weights to sides until arms parallel to floor, lower with control. Keep slight bend.',
      'Front Raises': 'Raise weights in front until arms parallel to floor, lower with control. Keep core tight.',
      'Hammer Curls': 'Curl weights up with neutral grip, squeeze biceps, lower with control. Keep elbows still.',
      'Skull Crushers': 'Lower weight behind head by bending elbows, extend arms up. Keep elbows stable.',
      'Leg Curls': 'Curl heels toward glutes, squeeze hamstrings, control return. Keep hips stable.',
      'Leg Extensions': 'Extend legs against resistance, squeeze quads, control return. Keep back straight.',
      'Russian Twists': 'Sit with knees bent, lean back slightly, rotate torso side to side. Keep core engaged.',
      'Bicycle Crunches': 'Lie down, bring opposite elbow to knee, alternate sides. Control the movement.',
      'Flutter Kicks': 'Lie down, lift legs slightly, alternate kicking up and down. Keep core engaged.',
      'High Knees': 'Run in place, bringing knees up high. Pump arms and maintain steady rhythm.',
      'Butt Kicks': 'Run in place, kicking heels toward glutes. Keep core tight and maintain rhythm.'
    };
    
    return descriptions[exerciseName] || 'Perform this exercise with proper form and control. Focus on technique.';
  }
}

