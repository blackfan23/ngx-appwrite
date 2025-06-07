import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RxDocument } from 'rxdb';
import { Observable } from 'rxjs';
import { Human, HumansRxdbService } from './appwrite.rxdb.service';

@Component({
  selector: 'app-human',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, AsyncPipe, CommonModule],
  template: `
    <div class="container mx-auto p-8">
      <h1 class="text-3xl font-bold mb-6">Human CRUD</h1>
      <form
        [formGroup]="humanForm"
        (ngSubmit)="saveHuman()"
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
        <button
          type="submit"
          [disabled]="humanForm.invalid"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
        >
          {{ humanForm.get('id')?.value ? 'Update' : 'Create' }}
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
                    (click)="editHuman(human)"
                    class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  >
                    Edit
                  </button>
                  <button
                    (click)="deleteHuman(human)"
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
export class HumanComponent {
  private formBuilder = inject(FormBuilder);
  private humansService = inject(HumansRxdbService);

  humanForm = this.formBuilder.group({
    id: [''],
    name: ['', Validators.required],
    age: [0, Validators.required],
    homeAddress: ['', Validators.required],
  });

  humans$: Observable<RxDocument<Human>[]> = this.humansService.documentList$();

  saveHuman(): void {
    if (this.humanForm.valid) {
      const humanData = this.humanForm.getRawValue();
      if (!humanData.id) {
        delete (humanData as Partial<Human>).id;
      }
      this.humansService.upsert(humanData as Human);
      this.resetForm();
    }
  }

  editHuman(human: RxDocument<Human>): void {
    this.humanForm.patchValue(human.toJSON());
  }

  deleteHuman(human: RxDocument<Human>): void {
    human.remove();
  }

  resetForm(): void {
    this.humanForm.reset({
      id: '',
      name: '',
      age: 0,
      homeAddress: '',
    });
  }
}
