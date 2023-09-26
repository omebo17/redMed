import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, timer, debounceTime, take, Subscription, tap } from 'rxjs';
import { ClientService } from 'src/app/client.service';
import { Client } from 'src/app/models/client';


 const ID_EXISTS_ERROR: ValidationErrors = { idExists: true};

export function idAsyncValidator( clientService: ClientService, id?: number): AsyncValidatorFn {
  return (control: AbstractControl):
    | Promise<ValidationErrors | null>
    | Observable<ValidationErrors | null> => {
    if (!control.valueChanges){
      return of(null);
    }

    return timer(300).pipe(
      debounceTime(300),
      switchMap(()=> {
        if(!control.value){
          return of(null);
        }
        control.markAsTouched();
        return clientService.checkIdExists(control.value, id).pipe(
          map((idExists: any) => (idExists.length? ID_EXISTS_ERROR : null)),
          catchError(() => of(null))
        )
      }),
      take(1)
    )
  }
}

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit, OnDestroy {

  constructor(private formBuilder: FormBuilder, private clientService: ClientService, private route: ActivatedRoute, private router: Router){}

  id?: number;
  client? : Client;
  userForm: FormGroup = new FormGroup({});
  cities: string[] = ['თბილისი', 'ბათუმი', 'თელავი','ზუგდიდი','სოხუმი'];
  sex: string[] = ['კაცი','ქალი'];
  private queryParamsSubscription?: Subscription;

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      name: ['', Validators.required],
      surename: ['', Validators.required],
      id: ['',{
        Validators: [Validators.required],
        asyncValidators: [idAsyncValidator(this.clientService, this.id)]
      }
      ],
      birthdayDate: ['', {
        validators: [Validators.required, this.validateAge.bind(this)]
      }],
      sex: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
    });

    this.queryParamsSubscription = this.route.queryParams.pipe(
      switchMap(params => {
        this.id = params['id'];
        if(this.id) {
          this.userForm.get('id')?.clearAsyncValidators();
          this.userForm.get('id')?.addAsyncValidators(idAsyncValidator(this.clientService, +this.id));
          return this.clientService.getClient(this.id);
        } else {
          return of(null)
        }
      }),
      tap(resp =>{
        if(resp){
          this.userForm.patchValue({
            name: resp[0].name,
            surename: resp[0].surename,
            id: resp[0].id,
            birthdayDate: resp[0].birthdayDate,
            sex: resp[0].sex,
            city: resp[0].city,
            address: resp[0].address,
          })
        }
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    if(this.queryParamsSubscription){
      this.queryParamsSubscription.unsubscribe();
    }
  }

  submitForm(id?: number){
    if(!id){
      if(this.userForm.valid){
        const id = Number(this.userForm.get('id')?.value);
        const clientData : Client = {...this.userForm.value,id};
        this.clientService.addClient(clientData).subscribe(
          resp => {
            console.log(resp)
            this.router.navigate(['/clients'])
          }
        );
      }
    } else {
      if(this.userForm.valid && this.id) {
        const id = Number(this.userForm.get('id')?.value);
        const clientData : Client = {...this.userForm.value,id};
        this.clientService.editClient(clientData, this.id).subscribe(resp =>
          {
            this.router.navigate(['/clients'])
          });
      }
    }
  }

  validateAge(control: AbstractControl): ValidationErrors | null {
    const birthdayDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthdayDate.getFullYear();
  
    if (age < 18) {
      return { underage: true };
    }
    return null;
  }
 

}
