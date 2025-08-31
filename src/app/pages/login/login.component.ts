import { Component, OnInit } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  formGroup!:FormGroup;
  hide = true;


 constructor(private authService: AuthService, private fb:FormBuilder){}

 ngOnInit(){
  this.formGroup=this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]]
    
  })
  
 }

 onSubmit(){
  const formValue=this.formGroup.value
  console.log(formValue);
  this.authService.login(formValue).subscribe();
  
 }

}
