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
