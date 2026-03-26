import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cancel-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  templateUrl: './cancel-success.component.html',
  styleUrl: './cancel-success.component.scss'
})
export class CancelSuccessComponent implements OnInit {
  reservationId: string | null = null;
  roomReservationId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.reservationId = params.get('reservation');
      this.roomReservationId = params.get('roomReservation');
    });
  }
}
