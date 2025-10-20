import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExercisesComponent } from '../exercises/exercises.component';
import { LoggerComponent } from '../logger/logger.component';
import { StatsComponent } from '../stats/stats.component';
import { ProfileComponent } from '../profile/profile.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ExercisesComponent, LoggerComponent, StatsComponent, ProfileComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private authService = inject(AuthService);
  activeTab = signal<'manager' | 'profile' | 'logger' | 'stats'>('logger');
  currentUser = this.authService.currentUser;
  showSettings = signal(false);

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

