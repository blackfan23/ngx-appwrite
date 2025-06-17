import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RxDocument } from 'rxdb';
import { Observable } from 'rxjs';
import {
  Alien,
  AliensRxdbService,
  Human,
  HumansRxdbService,
} from './appwrite.rxdb.service';

@Component({
  selector: 'app-human',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, AsyncPipe, CommonModule],
  template: `
    <div class="container mx-auto p-8">
      <h1 class="text-3xl font-bold mb-6">
        {{ currentEntityType === 'human' ? 'Human' : 'Alien' }} CRUD
      </h1>

      <div class="mb-4">
        <label for="entityTypeHuman" class="block text-gray-700 font-bold mb-2"
          >Select Entity Type:</label
        >
        <div class="flex">
          <label for="entityTypeHuman" class="inline-flex items-center mr-6">
            <input
              type="radio"
              class="form-radio"
              name="entityType"
              id="entityTypeHuman"
              value="human"
              [(ngModel)]="currentEntityType"
              (change)="resetForm()"
            />
            <span class="ml-2">Human</span>
          </label>
          <label for="entityTypeAlien" class="inline-flex items-center">
            <input
              type="radio"
              class="form-radio"
              name="entityType"
              id="entityTypeAlien"
              value="alien"
              [(ngModel)]="currentEntityType"
              (change)="resetForm()"
            />
            <span class="ml-2">Alien</span>
          </label>
        </div>
      </div>

      <form
        [formGroup]="currentEntityType === 'human' ? humanForm : alienForm"
        (ngSubmit)="saveEntity()"
        class="mb-8 p-6 bg-white rounded-lg shadow-md"
      >
        <input type="hidden" formControlName="id" />
        <div class="mb-4">
          <label for="name" class="block text-gray-700 font-bold mb-2"
            >Name:</label
          >
          <input
            type="text"
            id="name"
            formControlName="name"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        @if (currentEntityType === 'human') {
          <div class="mb-4">
            <label for="age" class="block text-gray-700 font-bold mb-2"
              >Age:</label
            >
            <input
              type="number"
              id="age"
              formControlName="age"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div class="mb-6">
            <label for="homeAddress" class="block text-gray-700 font-bold mb-2"
              >Home Address:</label
            >
            <input
              type="text"
              id="homeAddress"
              formControlName="homeAddress"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        } @else {
          <div class="mb-4">
            <label for="species" class="block text-gray-700 font-bold mb-2"
              >Species:</label
            >
            <input
              type="text"
              id="species"
              formControlName="species"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div class="mb-6">
            <label for="planet" class="block text-gray-700 font-bold mb-2"
              >Origin Planet:</label
            >
            <input
              type="text"
              id="planet"
              formControlName="planet"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        }

        <button
          type="submit"
          [disabled]="
            (currentEntityType === 'human' ? humanForm : alienForm).invalid
          "
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
        >
          {{
            (
              currentEntityType === 'human'
                ? humanForm.controls.id.value
                : alienForm.controls.id.value
            )
              ? 'Update'
              : 'Create'
          }}
        </button>
        <button
          type="button"
          (click)="resetForm()"
          class="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Reset
        </button>
      </form>

      <h2 class="text-2xl font-bold mb-4">Humans List</h2>
      <div class="shadow-md rounded-lg overflow-hidden mb-8">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th
                class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Age
              </th>
              <th
                class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Home Address
              </th>
              <th
                class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (human of humans$ | async; track human.id) {
              <tr class="hover:bg-gray-100">
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {{ human.name }}
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {{ human.age }}
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {{ human.homeAddress }}
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button
                    (click)="editEntity(human, 'human')"
                    class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  >
                    Edit
                  </button>
                  <button
                    (click)="deleteEntity(human, 'human')"
                    class="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <h2 class="text-2xl font-bold mb-4">Aliens List</h2>
      <div class="shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th
                class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Species
              </th>
              <th
                class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Origin Planet
              </th>
              <th
                class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (alien of aliens$ | async; track alien.id) {
              <tr class="hover:bg-gray-100">
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {{ alien.name }}
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {{ alien.species }}
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {{ alien.planet }}
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button
                    (click)="editEntity(alien, 'alien')"
                    class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  >
                    Edit
                  </button>
                  <button
                    (click)="deleteEntity(alien, 'alien')"
                    class="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [],
})
export class HumanComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private humansService = inject(HumansRxdbService);
  private aliensService = inject(AliensRxdbService);

  currentEntityType: 'human' | 'alien' = 'human';

  humanForm = this.formBuilder.group({
    id: [''],
    name: ['', Validators.required],
    age: [0, Validators.required],
    homeAddress: ['', Validators.required],
  });

  alienForm = this.formBuilder.group({
    id: [''],
    name: ['', Validators.required],
    species: ['', Validators.required],
    planet: ['', Validators.required],
  });

  humans$: Observable<RxDocument<Human>[]> = this.humansService.documentList$();
  aliens$: Observable<RxDocument<Alien>[]> = this.aliensService.documentList$();

  async ngOnInit(): Promise<void> {
    const humans = await this.humansService.documentList();
    console.log('Humans:', humans);
    const aliens = await this.aliensService.documentList();
    console.log('Aliens:', aliens);
  }

  saveEntity(): void {
    if (this.currentEntityType === 'human') {
      if (this.humanForm.valid) {
        const humanData: Human = this.humanForm.getRawValue() as Human;
        if (!humanData.id) {
          this.humansService.create(humanData);
        } else {
          this.humansService.update(humanData);
        }
        this.resetForm();
      }
    } else {
      if (this.alienForm.valid) {
        const alienData: Alien = this.alienForm.getRawValue() as Alien;
        if (!alienData.id) {
          this.aliensService.create(alienData);
        } else {
          this.aliensService.update(alienData);
        }
        this.resetForm();
      }
    }
  }

  editEntity(
    entity: RxDocument<Human> | RxDocument<Alien>,
    type: 'human' | 'alien',
  ): void {
    if (type === 'human') {
      this.humanForm.patchValue((entity as RxDocument<Human>).toJSON());
    } else {
      this.alienForm.patchValue((entity as RxDocument<Alien>).toJSON());
    }
  }

  deleteEntity(
    entity: RxDocument<Human> | RxDocument<Alien>,
    type: 'human' | 'alien',
  ): void {
    entity.remove();
  }

  resetForm(): void {
    this.humanForm.reset({
      id: '',
      name: '',
      age: 0,
      homeAddress: '',
    });
    this.alienForm.reset({
      id: '',
      name: '',
      species: '',
      planet: '',
    });
  }
}
