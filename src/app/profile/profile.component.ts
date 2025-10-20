import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';

export interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);

  profile = signal<UserProfile>({
    firstname: '',
    lastname: '',
    email: '',
    weight: undefined,
    height: undefined,
    age: undefined,
    gender: undefined,
    fitnessLevel: undefined,
    goals: []
  });

  isSaving = signal(false);
  expandedSections = signal<Set<string>>(new Set(['personal']));

  // Computed properties for BMI calculation
  bmi = computed(() => {
    const weight = this.profile().weight;
    const height = this.profile().height;
    if (weight && height && height > 0) {
      const heightInMeters = height / 100; // Convert cm to meters
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  });

  bmiCategory = computed(() => {
    const bmiValue = this.bmi();
    if (!bmiValue) return null;
    
    const bmiNum = parseFloat(bmiValue);
    if (bmiNum < 18.5) return 'Underweight';
    if (bmiNum < 25) return 'Normal weight';
    if (bmiNum < 30) return 'Overweight';
    return 'Obese';
  });

  constructor() {
    this.loadProfile();
  }

  toggleSection(section: string) {
    this.expandedSections.update(sections => {
      const newSections = new Set(sections);
      if (newSections.has(section)) {
        newSections.delete(section);
      } else {
        newSections.add(section);
      }
      return newSections;
    });
  }

  isExpanded(section: string): boolean {
    return this.expandedSections().has(section);
  }

  addGoal() {
    this.profile.update(profile => ({
      ...profile,
      goals: [...(profile.goals || []), '']
    }));
  }

  removeGoal(index: number) {
    this.profile.update(profile => ({
      ...profile,
      goals: profile.goals?.filter((_, i) => i !== index) || []
    }));
  }

  updateGoal(index: number, value: string) {
    this.profile.update(profile => ({
      ...profile,
      goals: profile.goals?.map((goal, i) => i === index ? value : goal) || []
    }));
  }

  saveProfile() {
    this.isSaving.set(true);
    
    // Filter out empty goals
    const profileData = {
      ...this.profile(),
      goals: this.profile().goals?.filter(goal => goal.trim() !== '') || []
    };

    this.apiService.updateProfile(profileData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastr.success('Profile updated successfully!', 'Success', {
          timeOut: 3000,
          progressBar: true,
          closeButton: true
        });
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.isSaving.set(false);
        this.toastr.error('Failed to update profile. Please try again.', 'Error', {
          timeOut: 5000,
          progressBar: true,
          closeButton: true
        });
      }
    });
  }

  private loadProfile() {
    this.apiService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.toastr.error('Failed to load profile data.', 'Error', {
          timeOut: 5000,
          progressBar: true,
          closeButton: true
        });
      }
    });
  }
}
