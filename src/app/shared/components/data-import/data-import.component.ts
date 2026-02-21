import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController,ModalController } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonSelect, IonButton, IonButtons, IonMenuButton, IonIcon, IonRow, IonCol, IonModal, IonLabel, IonItem, IonDatetime } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline } from 'ionicons/icons';


export interface ImportField {
  excelColumn: string;
  appField: string;
  sampleValue: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

@Component({
  selector: 'app-data-import',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,IonSelect,IonButton,IonButtons,IonIcon,IonModal,IonRow,IonCol,IonMenuButton, IonLabel, IonItem, IonDatetime,CommonModule, FormsModule, IonicModule],
  templateUrl: './data-import.component.html',
  styleUrls: ['./data-import.component.scss']
})
export class DataImportComponent implements OnInit {
  @Input() entityType: 'company' | 'contact' | 'lead' | 'deal' = 'contact';
  @Output() importComplete = new EventEmitter<ImportResult>();
  @Output() cancel = new EventEmitter<void>();

  currentStep: 'upload' | 'mapping' | 'preview' | 'importing' | 'complete' = 'upload';
  
  fileName: string = '';
  rawData: any[] = [];
  headers: string[] = [];
  
  fieldMappings: ImportField[] = [];
  previewData: any[] = [];
  
  isImporting = false;
  importProgress = 0;
  importResult: ImportResult | null = null;

  // Entity-specific field definitions
  fieldDefinitions: { [key: string]: { key: string; label: string; type: string }[] } = {
    company: [
      { key: 'name', label: 'Company Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'mobile', label: 'Mobile', type: 'text' },
      { key: 'website', label: 'Website', type: 'url' },
      { key: 'industry', label: 'Industry', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'state', label: 'State', type: 'text' },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'zip_code', label: 'Zip Code', type: 'text' }
    ],
    contact: [
      { key: 'first_name', label: 'First Name', type: 'text' },
      { key: 'last_name', label: 'Last Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'mobile', label: 'Mobile', type: 'text' },
      { key: 'company_id', label: 'Company ID', type: 'number' },
      { key: 'lead_status', label: 'Lead Status', type: 'text' },
      { key: 'source', label: 'Source', type: 'text' }
    ],
    lead: [
      { key: 'first_name', label: 'First Name', type: 'text' },
      { key: 'last_name', label: 'Last Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'mobile', label: 'Mobile', type: 'text' },
      { key: 'company_name', label: 'Company Name', type: 'text' },
      { key: 'lead_status', label: 'Lead Status', type: 'text' },
      { key: 'source', label: 'Source', type: 'text' }
    ],
    deal: [
      { key: 'name', label: 'Deal Name', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'text' },
      { key: 'stage', label: 'Stage', type: 'text' },
      { key: 'probability', label: 'Probability', type: 'number' },
      { key: 'expected_close_date', label: 'Expected Close Date', type: 'date' },
      { key: 'contact_id', label: 'Contact ID', type: 'number' },
      { key: 'company_id', label: 'Company ID', type: 'number' },
      { key: 'description', label: 'Description', type: 'textarea' }
    ]
  };

  constructor(
    private api: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private modcl:ModalController
  ) {}

  ngOnInit() {
    this.initializeMappings();
  }

  initializeMappings() {
    const fields = this.fieldDefinitions[this.entityType];
    this.fieldMappings = fields.map(f => ({
      excelColumn: '',
      appField: f.key,
      sampleValue: ''
    }));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.fileName = file.name;
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const content = e.target.result;
      
      // Check file type
      if (file.name.endsWith('.csv')) {
        this.parseCSV(content);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Basic Excel support - we'll try to parse as CSV first
        // For full Excel support, would need xlsx library
        this.parseExcelBasic(content);
      } else {
        this.showAlert('Error', 'Please upload a CSV or Excel file');
        return;
      }
    };
    reader.readAsText(file);
  }

  parseCSV(content: string) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      this.showAlert('Error', 'File must contain at least a header row and one data row');
      return;
    }

    // Parse headers
    this.headers = this.parseCSVLine(lines[0]);
    
    // Parse data rows
    this.rawData = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length > 0) {
        const row: any = {};
        this.headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        this.rawData.push(row);
      }
    }

    if (this.rawData.length > 0) {
      this.autoMapFields();
      this.currentStep = 'mapping';
    }
  }

  parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result;
  }

  // Basic Excel parsing - reads as binary string (would need xlsx library for full support)
  parseExcelBasic(content: string) {
    // This is a simplified approach - in production, use xlsx library
    // For now, we'll show a message that Excel support requires the library
    this.showAlert('Info', 'For Excel files (.xlsx), please convert to CSV format first. Click OK to try parsing anyway.', 
      async () => {
        // Try to parse as-is (works for simple cases)
        this.parseCSV(content);
      }
    );
  }

  autoMapFields() {
    const fields = this.fieldDefinitions[this.entityType];
    const sampleRow = this.rawData[0] || {};
    
    this.fieldMappings = fields.map(field => {
      // Try to find matching column
      let matchedColumn = '';
      
      // Exact match
      if (this.headers.includes(field.key)) {
        matchedColumn = field.key;
      } else {
        // Fuzzy match
        const lowerKey = field.key.toLowerCase().replace('_', ' ');
        for (const header of this.headers) {
          const lowerHeader = header.toLowerCase().replace(/[_\s]/g, '');
          if (lowerHeader === lowerKey.replace(/[_\s]/g, '')) {
            matchedColumn = header;
            break;
          }
          // Check for partial matches
          if (lowerHeader.includes(lowerKey) || lowerKey.includes(lowerHeader)) {
            matchedColumn = header;
            break;
          }
        }
      }
      
      return {
        excelColumn: matchedColumn,
        appField: field.key,
        sampleValue: matchedColumn ? (sampleRow[matchedColumn] || '') : ''
      };
    });
  }

  goToPreview() {
    // Validate mappings
    const mappedFields = this.fieldMappings.filter(m => m.excelColumn);
    if (mappedFields.length === 0) {
      this.showAlert('Error', 'Please map at least one field');
      return;
    }

    // Create preview data
    this.previewData = this.rawData.slice(0, 5).map(row => {
      const mappedRow: any = {};
      this.fieldMappings.forEach(mapping => {
        if (mapping.excelColumn) {
          mappedRow[mapping.appField] = row[mapping.excelColumn] || '';
        }
      });
      return mappedRow;
    });

    this.currentStep = 'preview';
  }

  async startImport() {
    this.isImporting = true;
    this.importProgress = 0;
    this.currentStep = 'importing';

    const mappedFields = this.fieldMappings.filter(m => m.excelColumn);
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process one by one to avoid Promise.allSettled compatibility issues
    for (let i = 0; i < this.rawData.length; i++) {
      const row = this.rawData[i];
      const record: any = {};
      
      mappedFields.forEach(mapping => {
        let value = row[mapping.excelColumn] || '';
        
        // Type conversions
        const fieldDef = this.fieldDefinitions[this.entityType].find(f => f.key === mapping.appField);
        if (fieldDef?.type === 'number') {
          value = parseFloat(value) || 0;
        }
        
        record[mapping.appField] = value;
      });

      try {
        await this.createRecord(record);
        success++;
      } catch (error: any) {
        failed++;
        if (errors.length < 10) {
          errors.push(error.message || 'Failed to create record');
        }
      }

      this.importProgress = Math.round(((i + 1) / this.rawData.length) * 100);
    }

    this.importResult = { success, failed, errors };
    this.currentStep = 'complete';
    this.isImporting = false;
    this.importComplete.emit(this.importResult);
  }

  createRecord(data: any): Promise<any> {
    let observable: any;
    
    switch (this.entityType) {
      case 'company':
        observable = this.api.createCompany(data);
        break;
      case 'contact':
        observable = this.api.createContact(data);
        break;
      case 'lead':
        // Leads are stored as contacts with lead_status
        observable = this.api.createContact({ ...data, lead_status: data.lead_status || 'new' });
        break;
      case 'deal':
        observable = this.api.createDeal(data);
        break;
      default:
        return Promise.reject(new Error('Unknown entity type'));
    }

    return firstValueFrom(observable).then((response: any) => {
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Failed to create record');
      }
    }).catch((error: any) => {
      throw new Error(error.error?.message || error.message || 'Failed to create record');
    });
  }

  goBack() {
    if (this.currentStep === 'mapping') {
      this.currentStep = 'upload';
    } else if (this.currentStep === 'preview') {
      this.currentStep = 'mapping';
    }
  }

  getFieldLabel(fieldKey: string): string {
    const field = this.fieldDefinitions[this.entityType].find(f => f.key === fieldKey);
    return field?.label || fieldKey;
  }

  updateSampleValue(mapping: ImportField) {
    if (mapping.excelColumn && this.rawData.length > 0) {
      mapping.sampleValue = this.rawData[0][mapping.excelColumn] || '';
    } else {
      mapping.sampleValue = '';
    }
  }

  downloadTemplate() {
    const fields = this.fieldDefinitions[this.entityType];
    const headers = fields.map(f => f.label);
    const csvContent = headers.join(',') + '\n' + headers.map(h => 'Sample ' + h).join(',');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.entityType}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  onCancel() {
    this.cancel.emit();
    this.modcl.dismiss();
  }

  private async showAlert(title: string, message: string, handler?: () => void) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: handler ? [
        { text: 'Cancel', role: 'cancel' },
        { text: 'OK', handler }
      ] : ['OK']
    });
    await alert.present();
  }
}
