import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExercisesComponent } from '../exercises/exercises.component';
import { LoggerComponent } from '../logger/logger.component';
import { StatsComponent } from '../stats/stats.component';
import { ProfileComponent } from '../profile/profile.component';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ExercisesComponent, LoggerComponent, StatsComponent, ProfileComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  activeTab = signal<'manager' | 'profile' | 'logger' | 'stats'>('logger');
  currentUser = this.authService.currentUser;
  showSettings = signal(false);

  ngOnInit() {
    this.checkExerciseGroups();
  }

  private checkExerciseGroups() {
    this.apiService.getExerciseGroups().subscribe({
      next: (exerciseGroups) => {
        // If no exercise groups exist or no categories, redirect to manager
        if (!exerciseGroups || !exerciseGroups.categories || exerciseGroups.categories.length === 0) {
          this.setTab('manager');
        }
      },
      error: (err) => {
        console.error('Failed to check exercise groups:', err);
        // On error, redirect to manager to be safe
        this.setTab('manager');
      }
    });
  }

  setTab(tab: 'manager' | 'profile' | 'logger' | 'stats') {
    this.activeTab.set(tab);
    this.showSettings.set(false);
  }

  toggleSettings() {
    this.showSettings.update(val => !val);
  }

  goBack() {
    this.setTab('logger');
  }

  logout() {
    this.authService.logout();
  }
}

