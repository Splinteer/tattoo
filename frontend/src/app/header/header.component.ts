import { Component, OnInit } from '@angular/core';
import { Auth0Service } from '../modules/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  collapsed = true;
  constructor(public auth0: Auth0Service) {}

  ngOnInit() {}
}
