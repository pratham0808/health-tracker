import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import moment from 'moment';

@Component({
  selector: 'app-daily-essentials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-essentials.component.html',
  styleUrl: './daily-essentials.component.scss'
})
export class DailyEssentialsComponent implements OnInit {
  private apiService = inject(ApiService);

  selectedDate = signal(this.getTodayDate());
  logEssential = signal<any>(null);
  userProfile = signal<any>(null);

  ngOnInit() {
    this.loadUserProfile();
    this.loadLogEssential();
  }

  dateChanged() {
    this.loadLogEssential();
  }

  updateWaterIntake(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      waterIntake: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update water intake:', err)
    });
  }

  updateSteps(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      steps: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update steps:', err)
    });
  }

  // Calories methods
  updateCaloriesConsumed(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      caloriesConsumed: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update calories consumed:', err)
    });
  }

  updateCaloriesBurned(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      caloriesBurned: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update calories burned:', err)
    });
  }

  // Sleep methods
  updateSleepHours(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      sleepHours: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update sleep hours:', err)
    });
  }

  updateSleepQuality(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      sleepQuality: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update sleep quality:', err)
    });
  }

  // Weight method
  updateWeight(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      weight: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update weight:', err)
    });
  }

  // Mood and Energy methods
  updateMood(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      mood: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update mood:', err)
    });
  }

  updateEnergy(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      energy: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update energy:', err)
    });
  }

  // Body Measurements methods
  updateBodyFatPercentage(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      bodyFatPercentage: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update body fat percentage:', err)
    });
  }

  updateMuscleMass(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      muscleMass: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update muscle mass:', err)
    });
  }

  updateWaistCircumference(value: number) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      waistCircumference: value
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update waist circumference:', err)
    });
  }

  // Supplements methods
  updateSupplements(supplements: any) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      supplements: supplements
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update supplements:', err)
    });
  }

  // Habits methods
  updateHabits(habits: any) {
    this.apiService.createOrUpdateLogEssential({
      date: this.selectedDate(),
      habits: habits
    }).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to update habits:', err)
    });
  }

  incrementWater() {
    const currentValue = this.logEssential()?.waterIntake || 0;
    this.updateWaterIntake(currentValue + 0.1);
  }

  decrementWater() {
    const currentValue = this.logEssential()?.waterIntake || 0;
    if (currentValue > 0) {
      this.updateWaterIntake(Math.max(0, currentValue - 0.1));
    }
  }

  incrementSteps() {
    const currentValue = this.logEssential()?.steps || 0;
    this.updateSteps(currentValue + 500);
  }

  decrementSteps() {
    const currentValue = this.logEssential()?.steps || 0;
    if (currentValue > 0) {
      this.updateSteps(Math.max(0, currentValue - 500));
    }
  }

  getWaterProgress(): number {
    const current = this.logEssential()?.waterIntake || 0;
    const goal = this.userProfile()?.waterGoal || 3;
    return Math.min(100, (current / goal) * 100);
  }

  getStepsProgress(): number {
    const current = this.logEssential()?.steps || 0;
    const goal = this.userProfile()?.stepsGoal || 10000;
    return Math.min(100, (current / goal) * 100);
  }

  // Progress calculation methods
  getCaloriesProgress(): number {
    const consumed = this.logEssential()?.caloriesConsumed || 0;
    const goal = this.userProfile()?.calorieGoal || 2000;
    return Math.min(100, (consumed / goal) * 100);
  }

  getSleepProgress(): number {
    const current = this.logEssential()?.sleepHours || 0;
    const goal = this.userProfile()?.sleepGoal || 8;
    return Math.min(100, (current / goal) * 100);
  }

  // Additional progress methods for new goals
  getBodyFatProgress(): number {
    const current = this.logEssential()?.bodyFatPercentage || 0;
    const goal = this.userProfile()?.bodyFatGoal || 15;
    if (goal === 0) return 0;
    return Math.min(100, (current / goal) * 100);
  }

  getMuscleMassProgress(): number {
    const current = this.logEssential()?.muscleMass || 0;
    const goal = this.userProfile()?.muscleMassGoal || 30;
    if (goal === 0) return 0;
    return Math.min(100, (current / goal) * 100);
  }

  getWaistProgress(): number {
    const current = this.logEssential()?.waistCircumference || 0;
    const goal = this.userProfile()?.waistGoal || 80;
    if (goal === 0) return 0;
    return Math.min(100, (current / goal) * 100);
  }

  getMeditationProgress(): number {
    const current = this.logEssential()?.habits?.meditation || 0;
    const goal = this.userProfile()?.meditationGoal || 10;
    if (goal === 0) return 0;
    return Math.min(100, (current / goal) * 100);
  }

  getReadingProgress(): number {
    const current = this.logEssential()?.habits?.reading || 0;
    const goal = this.userProfile()?.readingGoal || 30;
    if (goal === 0) return 0;
    return Math.min(100, (current / goal) * 100);
  }

  getScreenTimeProgress(): number {
    const current = this.logEssential()?.habits?.screenTime || 0;
    const goal = this.userProfile()?.screenTimeGoal || 8;
    if (goal === 0) return 0;
    // For screen time, we want to show how much of the limit we've used
    return Math.min(100, (current / goal) * 100);
  }

  // Getter methods for current values
  getCurrentCaloriesConsumed(): number {
    return this.logEssential()?.caloriesConsumed || 0;
  }

  getCurrentCaloriesBurned(): number {
    return this.logEssential()?.caloriesBurned || 0;
  }

  getNetCalories(): number {
    return this.getCurrentCaloriesConsumed() - this.getCurrentCaloriesBurned();
  }

  getCurrentSleepHours(): number {
    return this.logEssential()?.sleepHours || 0;
  }

  getCurrentSleepQuality(): number {
    return this.logEssential()?.sleepQuality || 3;
  }

  getCurrentWeight(): number {
    return this.logEssential()?.weight || 0;
  }

  getCurrentMood(): number {
    return this.logEssential()?.mood || 5;
  }

  getCurrentEnergy(): number {
    return this.logEssential()?.energy || 5;
  }

  getCurrentBodyFatPercentage(): number {
    return this.logEssential()?.bodyFatPercentage || 0;
  }

  getCurrentMuscleMass(): number {
    return this.logEssential()?.muscleMass || 0;
  }

  getCurrentWaistCircumference(): number {
    return this.logEssential()?.waistCircumference || 0;
  }

  getCurrentSupplements(): any {
    return this.logEssential()?.supplements || {
      multivitamin: false,
      proteinPowder: 0,
      vitaminD: false,
      omega3: false,
      other: ''
    };
  }

  getCurrentHabits(): any {
    return this.logEssential()?.habits || {
      meditation: 0,
      reading: 0,
      screenTime: 0,
      stressLevel: 5
    };
  }

  // Method to check if a section should be shown based on user preferences
  shouldShowSection(section: string): boolean {
    const preferences = this.userProfile()?.trackingPreferences;
    if (!preferences) {
      // Return default values if preferences not set
      const defaults: { [key: string]: boolean } = {
        waterIntake: true,
        steps: true,
        calories: false,
        sleep: false,
        weight: false,
        mood: false,
        energy: false,
        bodyMeasurements: false,
        supplements: false,
        habits: false
      };
      return defaults[section] || false;
    }
    return preferences[section as keyof typeof preferences] || false;
  }

  // Helper methods for supplements
  toggleMultivitamin(checked: boolean) {
    const current = this.getCurrentSupplements();
    this.updateSupplements({...current, multivitamin: checked});
  }

  toggleVitaminD(checked: boolean) {
    const current = this.getCurrentSupplements();
    this.updateSupplements({...current, vitaminD: checked});
  }

  toggleOmega3(checked: boolean) {
    const current = this.getCurrentSupplements();
    this.updateSupplements({...current, omega3: checked});
  }

  updateProteinPowder(value: number) {
    const current = this.getCurrentSupplements();
    this.updateSupplements({...current, proteinPowder: value});
  }

  updateOtherSupplements(value: string) {
    const current = this.getCurrentSupplements();
    this.updateSupplements({...current, other: value});
  }

  // Helper methods for habits
  updateMeditation(value: number) {
    const current = this.getCurrentHabits();
    this.updateHabits({...current, meditation: value});
  }

  updateReading(value: number) {
    const current = this.getCurrentHabits();
    this.updateHabits({...current, reading: value});
  }

  updateScreenTime(value: number) {
    const current = this.getCurrentHabits();
    this.updateHabits({...current, screenTime: value});
  }

  updateStressLevel(value: number) {
    const current = this.getCurrentHabits();
    this.updateHabits({...current, stressLevel: value});
  }

  private loadLogEssential() {
    this.apiService.getLogEssential(this.selectedDate()).subscribe({
      next: (logEssential) => {
        this.logEssential.set(logEssential);
      },
      error: (err: any) => console.error('Failed to load log essential:', err)
    });
  }

  private loadUserProfile() {
    this.apiService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
      },
      error: (err: any) => console.error('Failed to load user profile:', err)
    });
  }

  getTodayDate(): string {
    return moment().format('YYYY-MM-DD');
  }
}
