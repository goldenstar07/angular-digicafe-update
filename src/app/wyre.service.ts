import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WyreService {

  constructor(private http: HttpClient) { }

  createAccount(data): Promise<any>{
    try{
      return this.http.post('https://api.sendwyre.com/v3/accounts',data).toPromise();
    }catch(e){
      console.log(e);
    }  
  }

  getAccount(account): Promise<any>{
    try{
      return this.http.get(`https://api.sendwyre.com/v3/accounts/${account}`).toPromise();
    }catch(e){
      console.log(e);
    }  
  }
  
  
}
