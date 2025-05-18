import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { DAYS_IN_WEEK, CalendarSchedulerEventAction, CalendarSchedulerEvent, CalendarSchedulerViewComponent, SchedulerViewDay, SchedulerViewHour, SchedulerViewHourSegment, subPeriod, addPeriod, endOfPeriod, startOfPeriod, SchedulerEventTimesChangedEvent,  SchedulerDateFormatter } from 'angular-calendar-scheduler';
import { endOfDay, addMonths, addHours, startOfDay } from 'date-fns';
import { Subject } from 'rxjs';
import {
    CalendarView,
    CalendarDateFormatter,
    DateAdapter,
    CalendarModule,
    CalendarEvent
} from 'angular-calendar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventColor } from 'calendar-utils';
import { CalendarHeaderComponent } from '../../../../shared/components/calendar/calendar-header.component';

const colors: Record<string, EventColor> = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    CalendarModule,
    CalendarHeaderComponent
  ],
  providers: [{
        provide: CalendarDateFormatter,
        useClass: SchedulerDateFormatter
    }],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent  {
  view: CalendarView = CalendarView.Month;

  viewDate: Date = new Date();

  events: CalendarEvent[] = [
    {
      title: 'Click me',
      color: colors['yellow'],
      start: new Date(),
    },
    {
      title: 'Or click me',
      color: colors['blue'],
      start: new Date(),
    },
  ];

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
  }

}
