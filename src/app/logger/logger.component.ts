import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciseLoggerComponent } from '../exercise-logger/exercise-logger.component';
import { DailyEssentialsComponent } from '../daily-essentials/daily-essentials.component';

@Component({
  selector: 'app-logger',
  standalone: true,
  imports: [CommonModule, ExerciseLoggerComponent, DailyEssentialsComponent],
  templateUrl: './logger.component.html',
  styleUrl: './logger.component.scss'
})
export class LoggerComponent {
}
