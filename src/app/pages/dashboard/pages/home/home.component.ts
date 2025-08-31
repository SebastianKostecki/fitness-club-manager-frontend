import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { DAYS_IN_WEEK, CalendarSchedulerEventAction, CalendarSchedulerEvent, CalendarSchedulerViewComponent, SchedulerViewDay, SchedulerViewHour, SchedulerViewHourSegment, subPeriod, addPeriod, endOfPeriod, startOfPeriod, SchedulerEventTimesChangedEvent,  SchedulerDateFormatter } from 'angular-calendar-scheduler';
import { endOfDay, addMonths, addHours, startOfDay } from 'date-fns';
import { map, Observable, Subject, tap } from 'rxjs';
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
import { FitnessClassesService } from '../fitness-classes/services/fitness-classes.service';
import { ReservationsService } from '../reservations/services/reservations.service';
import { MatCardModule } from '@angular/material/card';

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
    CalendarHeaderComponent,
    MatCardModule
  ],
  providers: [{
        provide: CalendarDateFormatter,
        useClass: SchedulerDateFormatter
    }],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit  {
  
  view: CalendarView = CalendarView.Month;
  items = this.fitnessClassesService.items$.pipe(
    tap((value)=>{
      console.log(value)
    })
  ).subscribe()
  viewDate: Date = new Date();

  events$: Observable<CalendarEvent[]> = this.reservationsService.schedulerItems$ 
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
  closestEvent$: Observable<CalendarEvent | null> = this.events$.pipe(
  map(events => {
    const now = new Date();
   
    const futureEvents = events.filter(event => new Date(event.start) > now);

    if (futureEvents.length === 0) {
      return null; 
    }

    return futureEvents.reduce((closest, event) => {
      return new Date(event.start) < new Date(closest.start) ? event : closest;
    });
  }),
  tap(value => {
    console.log('Closest event:', value);
  })
);
pastEventsCount$: Observable<number> = this.events$.pipe(
  map(events => {
    const now = new Date();
    return events
      .filter(event => event.end) // bierz tylko te z datą końca
      .filter(event => new Date(event.end!) < now) // ! bo po poprzednim filtrze już jest na pewno
      .length;
  }),
  tap(count => {
    console.log('Liczba odbytych zajęć:', count);
  })
);



  constructor(
    private reservationsService: ReservationsService,
    private fitnessClassesService: FitnessClassesService
  ){}

  ngOnInit(): void {
    this.reservationsService.getReservations().subscribe()
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
  }

}
