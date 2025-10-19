import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExercisesComponent } from '../exercises/exercises.component';
import { LoggerComponent } from '../logger/logger.component';
import { StatsComponent } from '../stats/stats.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ExercisesComponent, LoggerComponent, StatsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private authService = inject(AuthService);
  activeTab = signal<'manager' | 'logger' | 'stats'>('logger');
  currentUser = this.authService.currentUser;
  showSettings = signal(false);

  setTab(tab: 'manager' | 'logger' | 'stats') {
    this.activeTab.set(tab);
    this.showSettings.set(false);
  }

  toggleSettings() {
    this.showSettings.update(val => !val);
  }

  logout() {
    this.authService.logout();
  }
}

