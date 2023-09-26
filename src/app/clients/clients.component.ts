import { Component, OnInit } from '@angular/core';
import { Client } from '../models/client';
import { ClientService } from '../client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[]=[];

  constructor(private clientService: ClientService, private router: Router){

  }
  ngOnInit(): void {
    this.clientService.getClients().subscribe(resp => {this.clients=resp})
  }

  edit(id: number){
    this.router.navigate(['/edit-client'], { queryParams : {id:id}})
  }

}
