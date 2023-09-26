import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Client } from './models/client';
@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiURL = 'http://localhost:3000/clients'

  constructor(private http: HttpClient) { 

  }

  addClient(client: Client):Observable<any>{
    return this.http.post(this.apiURL,client);
  }

  getClients():Observable<any>{
    return this.http.get(this.apiURL);
  }

  editClient(client: Client, id: number): Observable<any>{
    const deleteURL = `${this.apiURL}/${id}`;
    const deleteRequest = this.http.delete(deleteURL);
    const addRequest = this.http.post(this.apiURL,client);
    return forkJoin([deleteRequest,addRequest]);
  }

  getClient(id: number): Observable<any>{
    const url = `${this.apiURL}?id=${id}`;
    return this.http.get(url);
  }

  checkIdExists(id: number, expect?: number): Observable<boolean>{
    if(id===expect){
      const url = `${this.apiURL}?id=-1`;
      return this.http.get<boolean>(url);
    }
    const url = `${this.apiURL}?id=${id}`;
    return this.http.get<boolean>(url);
  }


}
