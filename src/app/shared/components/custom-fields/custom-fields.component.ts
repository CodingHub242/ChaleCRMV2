import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CustomField, CustomFieldValue } from '../../../models';

@Component({
  selector: 'app-custom-fields',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <div class="custom-fields-section" *ngIf="fields.length > 0">
      <h3>Custom Fields</h3>
      
      <div class="field-item" *ngFor="let field of fields">
        <!-- Text Input -->
        <ion-item *ngIf="field.type === 'text'" lines="full">
          <ion-label position="floating">{{ field.label }}{{ field.required ? ' *' : '' }}</ion-label>
          <ion-input 
            [type]="'text'" 
            [(ngModel)]="fieldValues[field.name]" 
            [name]="field.name"
            [required]="field.required">
          </ion-input>
        </ion-item>

        <!-- Textarea -->
        <ion-item *ngIf="field.type === 'textarea'" lines="full">
          <ion-label position="floating">{{ field.label }}{{ field.required ? ' *' : '' }}</ion-label>
          <ion-textarea 
            [(ngModel)]="fieldValues[field.name]" 
            [name]="field.name"
            [required]="field.required"
            rows="3">
          </ion-textarea>
        </ion-item>

        <!-- Number Input -->
        <ion-item *ngIf="field.type === 'number'" lines="full">
          <ion-label position="floating">{{ field.label }}{{ field.required ? ' *' : '' }}</ion-label>
          <ion-input 
            [type]="'number'" 
            [(ngModel)]="fieldValues[field.name]" 
            [name]="field.name"
            [required]="field.required">
          </ion-input>
        </ion-item>

        <!-- Date Picker -->
        <ion-item *ngIf="field.type === 'date'" lines="full">
          <ion-label position="floating">{{ field.label }}{{ field.required ? ' *' : '' }}</ion-label>
          <ion-datetime 
            [(ngModel)]="fieldValues[field.name]" 
            [name]="field.name"
            [required]="field.required"
            presentation="date">
          </ion-datetime>
        </ion-item>

        <!-- Select Dropdown -->
        <ion-item *ngIf="field.type === 'select'" lines="full">
          <ion-label position="floating">{{ field.label }}{{ field.required ? ' *' : '' }}</ion-label>
          <ion-select 
            [(ngModel)]="fieldValues[field.name]" 
            [name]="field.name"
            [required]="field.required"
            interface="popover">
            <ion-select-option *ngFor="let option of field.options" [value]="option">
              {{ option }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Multi-Select -->
        <ion-item *ngIf="field.type === 'multiselect'" lines="full">
          <ion-label position="floating">{{ field.label }}{{ field.required ? ' *' : '' }}</ion-label>
          <ion-select 
            [(ngModel)]="fieldValues[field.name]" 
            [name]="field.name"
            [required]="field.required"
            multiple="true"
            interface="popover">
            <ion-select-option *ngFor="let option of field.options" [value]="option">
              {{ option }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Checkbox -->
        <div *ngIf="field.type === 'checkbox'" class="checkbox-field">
          <ion-checkbox 
            [(ngModel)]="fieldValues[field.name]" 
            [name]="field.name"
            [required]="field.required">
          </ion-checkbox>
          <ion-label>{{ field.label }}{{ field.required ? ' *' : '' }}</ion-label>
        </div>

        <!-- Radio Buttons -->
        <div *ngIf="field.type === 'radio'" class="radio-field">
          <ion-label>{{ field.label }}{{ field.required ? ' *' : '' }}</ion-label>
          <ion-radio-group [(ngModel)]="fieldValues[field.name]" [name]="field.name">
            <ion-item *ngFor="let option of field.options" lines="none">
              <ion-radio [value]="option" slot="start"></ion-radio>
              <ion-label>{{ option }}</ion-label>
            </ion-item>
          </ion-radio-group>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-fields-section {
      background: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .custom-fields-section h3 {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .field-item {
      margin-bottom: 12px;
    }

    .field-item:last-child {
      margin-bottom: 0;
    }

    .field-item ion-item {
      --padding-start: 0;
      --padding-end: 0;
    }

    .checkbox-field,
    .radio-field {
      padding: 12px 0;
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .radio-field ion-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
  `]
})
export class CustomFieldsComponent {
  @Input() fields: CustomField[] = [];
  @Input() entityValues: CustomFieldValue[] = [];
  @Output() valuesChanged = new EventEmitter<{ [key: string]: string }>();

  fieldValues: { [key: string]: string } = {};

  ngOnInit(): void {
    // Initialize field values from existing entity values
    if (this.entityValues && this.entityValues.length > 0) {
      this.entityValues.forEach(val => {
        this.fieldValues[`field_${val.field_id}`] = val.value;
      });
    }
  }

  ngOnChanges(): void {
    if (this.entityValues && this.entityValues.length > 0) {
      this.entityValues.forEach(val => {
        this.fieldValues[`field_${val.field_id}`] = val.value;
      });
    }
  }

  onValueChange(): void {
    this.valuesChanged.emit(this.fieldValues);
  }

  getFieldValue(fieldName: string): string {
    return this.fieldValues[fieldName] || '';
  }
}
