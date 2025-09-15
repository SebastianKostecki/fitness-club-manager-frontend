import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UserService, User } from '../../../../shared/services/user.service';
import { environment } from '../../../../../environments/environment';

export interface UserWithRole extends User {
  isEditing?: boolean;
  newRole?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users$: Observable<UserWithRole[]>;
  currentUser$: Observable<User | null>;
  
  availableRoles = [
    { value: 'admin', label: 'Administrator', icon: '👑' },
    { value: 'trainer', label: 'Trener', icon: '💪' },
    { value: 'receptionist', label: 'Recepcjonista', icon: '🏢' },
    { value: 'regular', label: 'Użytkownik', icon: '👤' }
  ];

  displayedColumns: string[] = ['username', 'email', 'role', 'createdAt', 'actions'];

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.currentUser$ = this.userService.currentUser$;
    this.users$ = this.http.get<{users: User[]}>(`${environment.apiUrl}/users`).pipe(
      map(response => response.users.map(user => ({
        ...user,
        isEditing: false,
        newRole: user.Role
      })))
    );
  }

  ngOnInit(): void {
    // Data will be loaded automatically via observables
  }

  getRoleDisplayName(role: string): string {
    const roleObj = this.availableRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  getRoleIcon(role: string): string {
    const roleObj = this.availableRoles.find(r => r.value === role);
    return roleObj ? roleObj.icon : '👤';
  }

  getRoleColor(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'warn';
      case 'trainer': return 'primary';
      case 'receptionist': return 'accent';
      case 'regular': return 'basic';
      default: return 'basic';
    }
  }

  startEditing(user: UserWithRole): void {
    user.isEditing = true;
    user.newRole = user.Role;
  }

  cancelEditing(user: UserWithRole): void {
    user.isEditing = false;
    user.newRole = user.Role;
  }

  saveRole(user: UserWithRole): void {
    if (!user.newRole || user.newRole === user.Role) {
      user.isEditing = false;
      return;
    }

    this.http.put(`${environment.apiUrl}/users/${user.UserID}/role`, {
      Role: user.newRole
    }).subscribe({
      next: () => {
        user.Role = user.newRole!;
        user.isEditing = false;
        this.snackBar.open(`Rola użytkownika ${user.Username} została zaktualizowana`, 'Zamknij', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        this.snackBar.open('Błąd podczas aktualizacji roli użytkownika', 'Zamknij', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        user.newRole = user.Role;
      }
    });
  }

  canEditUser(user: UserWithRole, currentUser: User | null): boolean {
    if (!currentUser) {
      return false;
    }
    
    // Cannot edit your own role
    if (user.UserID === currentUser.UserID) {
      return false;
    }
    
    // Admin can edit all users
    if (currentUser.Role === 'admin') {
      return true;
    }
    
    // Receptionist can edit regular and trainer users
    if (currentUser.Role === 'receptionist') {
      return user.Role === 'regular' || user.Role === 'trainer';
    }
    
    return false;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  deleteUser(user: UserWithRole): void {
    this.showDeleteConfirmation(user);
  }

  private showDeleteConfirmation(user: UserWithRole): void {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(5px);
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'delete-confirmation-modal';
    modal.style.cssText = `
      background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);
      border-radius: 20px;
      padding: 32px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      color: white;
      text-align: center;
      position: relative;
      animation: modalSlideIn 0.3s ease-out;
    `;

    modal.innerHTML = `
      <div class="modal-header" style="
        text-align: center; 
        margin-bottom: 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
      ">
        <div class="warning-icon" style="
          font-size: 64px; 
          margin-bottom: 24px;
          display: block;
          width: 100%;
        ">⚠️</div>
        <h2 style="
          margin: 0 0 20px 0; 
          font-size: 32px; 
          font-weight: 700; 
          line-height: 1.2;
          color: #fff;
          width: 100%;
          display: block;
        ">Usuń użytkownika</h2>
        <div style="
          background: rgba(255, 71, 87, 0.2);
          border: 1px solid rgba(255, 71, 87, 0.4);
          border-radius: 12px;
          padding: 12px 20px;
          display: block;
          margin: 0;
          width: auto;
        ">
          <p style="
            margin: 0; 
            opacity: 1; 
            font-size: 16px; 
            font-weight: 600;
            color: #ff6b7a;
            text-align: center;
          ">Ta operacja jest nieodwracalna!</p>
        </div>
      </div>
      
      <div class="modal-content">
        <div class="user-info" style="
          background: rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 24px;
          margin: 24px 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        ">
          <div style="
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #fff;
            text-align: center;
          ">${user.Username}</div>
          <div style="
            opacity: 0.9;
            margin-bottom: 8px;
            font-size: 16px;
            font-weight: 500;
            text-align: center;
          ">${user.Email}</div>
          <div style="
            opacity: 0.9;
            font-size: 16px;
            font-weight: 500;
            text-align: center;
            margin-top: 8px;
          ">
            <span style="
              background: rgba(255, 255, 255, 0.2);
              padding: 6px 16px;
              border-radius: 20px;
              font-weight: 600;
              display: inline-block;
            ">
              ${this.getRoleIcon(user.Role)} ${this.getRoleDisplayName(user.Role)}
            </span>
          </div>
        </div>
        
        <div class="warning-message" style="
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid rgba(255, 71, 87, 0.3);
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
          text-align: center;
        ">
          <p style="
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            line-height: 1.4;
            color: #fff;
          ">
            Czy na pewno chcesz usunąć tego użytkownika?
          </p>
          <p style="
            margin: 8px 0 0 0;
            font-size: 16px;
            font-weight: 500;
            opacity: 0.9;
            line-height: 1.4;
          ">
            Wszystkie dane zostaną trwale usunięte
          </p>
        </div>
      </div>
      
      <div class="modal-actions" style="
        display: flex;
        gap: 16px;
        justify-content: center;
        margin-top: 32px;
      ">
        <button class="cancel-btn" style="
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
        ">Anuluj</button>
        <button class="confirm-btn" style="
          background: #ff4757;
          border: 2px solid #ff4757;
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
        ">Tak, usuń</button>
      </div>
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.8) translateY(-50px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      .cancel-btn:hover {
        background: rgba(255, 255, 255, 0.25) !important;
        border-color: rgba(255, 255, 255, 0.5) !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
      }
      
      .confirm-btn:hover {
        background: #ff3742 !important;
        border-color: #ff3742 !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 71, 87, 0.4);
      }
      
      .user-info {
        transition: all 0.3s ease;
      }
      
      .user-info:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        transform: translateY(-1px);
      }
      
      .warning-message {
        transition: all 0.3s ease;
      }
      
      .warning-message:hover {
        background: rgba(255, 71, 87, 0.15) !important;
        border-color: rgba(255, 71, 87, 0.4) !important;
      }
      
      .modal-header .warning-icon {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .modal-header {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
      }
      
      .modal-header > * {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
      }
    `;
    document.head.appendChild(style);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add event listeners
    const cancelBtn = modal.querySelector('.cancel-btn');
    const confirmBtn = modal.querySelector('.confirm-btn');

    const closeModal = () => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
    };

    cancelBtn?.addEventListener('click', closeModal);
    confirmBtn?.addEventListener('click', () => {
      closeModal();
      this.performUserDeletion(user);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }

  private performUserDeletion(user: UserWithRole): void {
    this.http.delete(`${environment.apiUrl}/users/${user.UserID}`).subscribe({
      next: () => {
        this.snackBar.open(`Użytkownik ${user.Username} został usunięty`, 'Zamknij', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Refresh the users list
        this.users$ = this.http.get<{users: User[]}>(`${environment.apiUrl}/users`).pipe(
          map(response => response.users.map(user => ({
            ...user,
            isEditing: false,
            newRole: user.Role
          })))
        );
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        let errorMessage = 'Błąd podczas usuwania użytkownika';
        
        if (error.status === 403) {
          errorMessage = error.error?.message || 'Brak uprawnień do usunięcia tego użytkownika';
        } else if (error.status === 404) {
          errorMessage = 'Użytkownik nie został znaleziony';
        }
        
        this.snackBar.open(errorMessage, 'Zamknij', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  canDeleteUser(user: UserWithRole, currentUser: User | null): boolean {
    if (!currentUser) {
      return false;
    }
    
    // Cannot delete yourself
    if (user.UserID === currentUser.UserID) {
      return false;
    }
    
    // Admin can delete all users except other admins
    if (currentUser.Role === 'admin') {
      return user.Role !== 'admin';
    }
    
    // Receptionist can delete regular and trainer users
    if (currentUser.Role === 'receptionist') {
      return user.Role === 'regular' || user.Role === 'trainer';
    }
    
    return false;
  }
}
