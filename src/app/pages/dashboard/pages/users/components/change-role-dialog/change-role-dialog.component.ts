import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './change-role-dialog.component.html',
  styleUrl: './change-role-dialog.component.scss'
})
export class ChangeRoleDialogComponent {
  selectedRole: string = '';

  constructor(
    private dialogRef: MatDialogRef<ChangeRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Ustaw domyślną rolę na przeciwną do obecnej
    this.selectedRole = this.data?.user?.Role === 'regular' ? 'trener' : 'regular';
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'regular': return 'Użytkownik';
      case 'trener': return 'Trener';
      case 'receptionist': return 'Recepcjonista';
      case 'admin': return 'Administrator';
      default: return role;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.selectedRole);
  }
}
