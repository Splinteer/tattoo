import { Component, OnInit } from '@angular/core';
import { Auth0Service } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(public auth0: Auth0Service) {}

  ngOnInit() {}
}
