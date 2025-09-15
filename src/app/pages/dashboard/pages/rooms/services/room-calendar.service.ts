import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RoomCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'room_reservation' | 'fitness_class';
  color: string;
  trainerName?: string;
  roomName?: string;
  meta: {
    reservationId?: number;
    classId?: number;
    userName?: string;
    userEmail?: string;
    trainerName?: string;
    capacity?: number;
    availableSpots?: number;
    currentReservations?: number;
    isFull?: boolean;
  };
}

export interface RoomCalendarResponse {
  events: RoomCalendarEvent[];
  roomId: string;
  period: {
    from: string;
    to: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RoomCalendarService {

  constructor(private http: HttpClient) { }

  getRoomCalendar(roomId: string, from: string, to: string): Observable<RoomCalendarResponse> {
    const url = `http://localhost:8080/rooms/${roomId}/calendar`;
    return this.http.get<RoomCalendarResponse>(url, {
      params: { from, to }
    });
  }
}
