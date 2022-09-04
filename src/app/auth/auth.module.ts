import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FirstLoginComponent } from './firstLogin/firstLogin.component';

@NgModule({
  imports: [CommonModule],
  declarations: [LoginComponent, FirstLoginComponent],
})
export class AuthModule {}
