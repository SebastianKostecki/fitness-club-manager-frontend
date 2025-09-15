import { Component, OnInit } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  formGroup!:FormGroup;
  hide = true;
  loading = false;
  apiError = '';


 constructor(private authService: AuthService, private fb:FormBuilder){}

 ngOnInit(){
  this.formGroup=this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]]
    
  })
  
 }

 onSubmit(){
  if (this.formGroup.invalid) return;
  this.apiError = '';
  this.loading = true;
  
  const formValue = this.formGroup.value;
  this.authService.login(formValue).subscribe({
    next: () => {
      this.loading = false;
    },
    error: (err) => {
      this.loading = false;
      this.apiError = err?.error?.message || 'Nie udało się zalogować.';
    }
  });
 }

}
