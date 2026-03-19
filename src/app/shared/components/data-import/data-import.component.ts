import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController,ModalController } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonSelect, IonButton, IonButtons, IonMenuButton, IonIcon, IonRow, IonCol, IonModal, IonLabel, IonItem, IonDatetime } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, folder } from 'ionicons/icons';


interface DealGroup {
  id: number;
  name: string;
  color?: string;
}


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
  @Input() entityType: 'company' | 'contact' | 'lead' | 'deal' | 'sqr' = 'contact';
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

  // Deal groups for import
  groups: DealGroup[] = [];
  selectedGroupId: number | null = null;

  // For SQR name lookups
  contactsMap: { [key: string]: number } = {};
  companiesMap: { [key: string]: number } = {};
  usersMap: { [key: string]: number } = {};

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
      { key: 'name', label: 'Lead Name', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'text' },
      { key: 'stage', label: 'Stage', type: 'text' },
      { key: 'probability', label: 'Probability', type: 'number' },
      { key: 'expected_close_date', label: 'Expected Close Date', type: 'date' },
      { key: 'contact_id', label: 'Contact ID', type: 'number' },
      { key: 'company_id', label: 'Company ID', type: 'number' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'group_name', label: 'Group Name', type: 'text' }
    ],
    sqr: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'ticket_number', label: 'Ticket Number', type: 'text' },
      { key: 'type', label: 'Type', type: 'select' },
      { key: 'priority', label: 'Priority', type: 'select' },
      { key: 'status', label: 'Status', type: 'select' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'contact_id', label: 'Contact ID', type: 'number' },
      { key: 'contact_name', label: 'Contact Name', type: 'text' },
      { key: 'company_id', label: 'Company ID', type: 'number' },
      { key: 'company_name', label: 'Company Name', type: 'text' },
      { key: 'assigned_to', label: 'Assigned To (User ID)', type: 'number' },
      { key: 'assigned_to_name', label: 'Assigned To (Name)', type: 'text' },
      { key: 'resolution_notes', label: 'Resolution Notes', type: 'textarea' }
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
    if (this.entityType === 'deal') {
      this.loadGroups();
    }
    if (this.entityType === 'sqr') {
      this.loadContactsForLookup();
      this.loadCompaniesForLookup();
      this.loadUsersForLookup();
    }
  }

  loadGroups(): void {
    this.api.getDealGroups().subscribe({
      next: (response) => {
        this.groups = response.data || [];
      }
    });
  }

  // Load all contacts recursively (handles pagination)
  loadContactsForLookup(): void {
    console.log('Loading contacts for lookup...');
    this.loadContactsPage(1);
  }

  private loadContactsPage(page: number): void {
    this.api.getContacts({ per_page: 1000, page }).subscribe({
      next: (response) => {
        console.log('Contacts API response page', page + ':', response);
        const contacts = response.data || [];
        console.log('Loaded contacts page', page + ':', contacts.length);
        
        // Process this page's contacts
        contacts.forEach((contact: any) => {
          // Try different name combinations
          const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim().toLowerCase();
          if (fullName) {
            this.contactsMap[fullName] = contact.id;
          }
          // Also map first_name and last_name individually for better matching
          if (contact.first_name) {
            this.contactsMap[contact.first_name.toLowerCase()] = contact.id;
          }
          if (contact.last_name) {
            this.contactsMap[contact.last_name.toLowerCase()] = contact.id;
          }
          if (contact.email) {
            this.contactsMap[contact.email.toLowerCase()] = contact.id;
          }
        });
        
        // Check if there are more pages
        const hasMore = response.next_page_url !== null;
        console.log('Page', page, 'has more:', hasMore);
        
        if (hasMore) {
          // Fetch next page
          this.loadContactsPage(page + 1);
        } else {
          // All done
          console.log('All contacts loaded. Total map entries:', Object.keys(this.contactsMap).length);
        }
      },
      error: (err) => {
        console.error('Error loading contacts:', err);
      }
    });
  }

  // Load all companies recursively (handles pagination)
  loadCompaniesForLookup(): void {
    console.log('Loading companies for lookup...');
    this.loadCompaniesPage(1);
  }

  private loadCompaniesPage(page: number): void {
    this.api.getCompanies({ per_page: 1000, page }).subscribe({
      next: (response) => {
        const companies = response.data || [];
        console.log('Loaded companies page', page + ':', companies.length);
        
        companies.forEach((company: any) => {
          if (company.name) {
            this.companiesMap[company.name.toLowerCase()] = company.id;
          }
          if (company.email) {
            this.companiesMap[company.email.toLowerCase()] = company.id;
          }
        });
        
        const hasMore = response.next_page_url !== null;
        if (hasMore) {
          this.loadCompaniesPage(page + 1);
        } else {
          console.log('All companies loaded. Total map entries:', Object.keys(this.companiesMap).length);
        }
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });
  }

  // Load users for assigned_to lookup using organization users endpoint (no pagination - get all)
  loadUsersForLookup(): void {
    console.log('Loading users for lookup...');
    this.api.getOrganizationUsers().subscribe({
      next: (response) => {
        console.log('Users API response:', response);
        const users = response.data || [];
        console.log('Loaded users:', users.length);
        
        users.forEach((user: any) => {
          // Map name variations
          if (user.name) {
            this.usersMap[user.name.toLowerCase()] = user.id;
            console.log('Mapped user:', user.name, '->', user.id);
            
            // Also map first name and last name separately
            const nameParts = user.name.split(' ');
            if (nameParts.length > 1) {
              this.usersMap[nameParts[0].toLowerCase()] = user.id;
              this.usersMap[nameParts[nameParts.length - 1].toLowerCase()] = user.id;
            }
          }
          if (user.email) {
            this.usersMap[user.email.toLowerCase()] = user.id;
          }
        });
        
        console.log('All users loaded. Total map entries:', Object.keys(this.usersMap).length);
        console.log('Users map built:', this.usersMap);
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  async createDealGroup(name: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.api.createDealGroup({ name }).subscribe({
        next: (response) => {
          if (response.success) {
            // Add to local groups
            this.groups.push(response.data);
            resolve(response.data.id);
          } else {
            reject(new Error(response.message));
          }
        },
        error: (err) => reject(err)
      });
    });
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

    // For deals, pre-process group names to get group_ids
    let groupIdMap: { [key: string]: number } = {};
    if (this.entityType === 'deal') {
      // Get all unique group names from the data
      const groupNames = new Set<string>();
      for (const row of this.rawData) {
        const groupNameField = this.fieldMappings.find(m => m.appField === 'group_name');
        if (groupNameField?.excelColumn && row[groupNameField.excelColumn]) {
          groupNames.add(row[groupNameField.excelColumn]);
        }
      }
      
      // Create or find groups
      for (const groupName of groupNames) {
        // Check if group exists
        const existingGroup = this.groups.find(g => g.name.toLowerCase() === groupName.toLowerCase());
        if (existingGroup) {
          groupIdMap[groupName.toLowerCase()] = existingGroup.id;
        } else {
          // Create new group
          try {
            const newGroupId = await this.createDealGroup(groupName);
            groupIdMap[groupName.toLowerCase()] = newGroupId;
          } catch (e) {
            console.error('Failed to create group:', groupName, e);
          }
        }
      }
    }

    // Process one by one to avoid Promise.allSettled compatibility issues
    for (let i = 0; i < this.rawData.length; i++) {
      const row = this.rawData[i];
      const record: any = {};
      
      mappedFields.forEach(mapping => {
        let value = row[mapping.excelColumn] || '';
        
        // Skip empty values for ID fields
        if (value === '' && ['contact_id', 'company_id', 'assigned_to'].includes(mapping.appField)) {
          return; // Don't set empty ID fields
        }
        
        // Type conversions
        const fieldDef = this.fieldDefinitions[this.entityType].find(f => f.key === mapping.appField);
        if (fieldDef?.type === 'number' && value !== '') {
          value = parseFloat(value) || 0;
        }
        
        // Skip group_name - we'll handle it separately
        if (mapping.appField !== 'group_name') {
          record[mapping.appField] = value;
        }
      });

      // Add group_id if group_name was provided
      if (this.entityType === 'deal') {
        const groupNameField = this.fieldMappings.find(m => m.appField === 'group_name');
        if (groupNameField?.excelColumn && row[groupNameField.excelColumn]) {
          const groupName = row[groupNameField.excelColumn];
          record.group_id = groupIdMap[groupName.toLowerCase()] || null;
        } else if (this.selectedGroupId) {
          // Use selected default group
          record.group_id = this.selectedGroupId;
        }
      }

      // For SQR, set default values for required fields if not provided
      if (this.entityType === 'sqr') {
        // Map common status variations to valid SQR status values
        const statusMapping: { [key: string]: string } = {
          'new': 'Open',
          'new ticket': 'Open',
          'open': 'Open',
          'in progress': 'In Progress',
          'inprogress': 'In Progress',
          'progress': 'In Progress',
          'escalated': 'Escalated',
          'resolved': 'Resolved',
          'closed': 'Closed',
          'done': 'Closed',
          'completed': 'Closed'
        };

        if (record.status) {
          const normalizedStatus = record.status.toString().toLowerCase().trim();
          record.status = statusMapping[normalizedStatus] || record.status;
        } else {
          record.status = 'Open'; // Default status
        }

        // Map common type variations to valid SQR type values
        const typeMapping: { [key: string]: string } = {
          'complaint': 'Complaint',
          'complaints': 'Complaint',
          'feedback': 'Feedback',
          'suggestion': 'Suggestion',
          'suggestions': 'Suggestion',
          'inquiry': 'Inquiry',
          'inquiries': 'Inquiry',
          'question': 'Inquiry',
          'support': 'Inquiry'
        };

        if (record.type) {
          const normalizedType = record.type.toString().toLowerCase().trim();
          record.type = typeMapping[normalizedType] || record.type;
        } else {
          record.type = 'Inquiry'; // Default type
        }

        // Map common priority variations to valid SQR priority values
        const priorityMapping: { [key: string]: string } = {
          'low': 'Low',
          'medium': 'Medium',
          'high': 'High',
          'critical': 'Critical',
          'urgent': 'Critical',
          'lowest': 'Low',
          'highest': 'Critical',
          'normal': 'Medium'
        };

        if (record.priority) {
          const normalizedPriority = record.priority.toString().toLowerCase().trim();
          record.priority = priorityMapping[normalizedPriority] || record.priority;
        } else {
          record.priority = 'Medium'; // Default priority
        }

        // Handle contact_name -> contact_id lookup (only if contact_id not already set)
        const contactNameField = this.fieldMappings.find(m => m.appField === 'contact_name');
        if (contactNameField?.excelColumn && row[contactNameField.excelColumn] && !record.contact_id) {
          const contactName = row[contactNameField.excelColumn].toString().trim().toLowerCase();
          const nameParts = contactName.split(' ');
          //console.log('Looking up contact:', contactName);
         // console.log('Contacts map keys:', Object.keys(this.contactsMap));
          
          // Try exact match first
          let foundId = this.contactsMap[contactName];
          //console.log('Exact match:', foundId);
          
          // If no exact match, try partial match (first or last name)
          if (!foundId) {
            for (const part of nameParts) {
              if (part.length > 2) { // Avoid matching on short words like "of", "the"
                foundId = this.contactsMap[part];
            //    console.log('Partial match on', part, ':', foundId);
                if (foundId) break;
              }
            }
          }
          
          // Try matching by first name + last name combination
          if (!foundId && nameParts.length >= 2) {
            const firstLast = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
            foundId = this.contactsMap[firstLast];
            //console.log('First+Last match on', firstLast, ':', foundId);
          }
          
          if (foundId) {
            record.contact_id = foundId;
          }
        }

        // Handle company_name -> company_id lookup (only if company_id not already set)
        const companyNameField = this.fieldMappings.find(m => m.appField === 'company_name');
        if (companyNameField?.excelColumn && row[companyNameField.excelColumn] && !record.company_id) {
          const companyName = row[companyNameField.excelColumn].toString().trim().toLowerCase();
          const foundId = this.companiesMap[companyName];
          if (foundId) {
            record.company_id = foundId;
          }
        }

        // Handle assigned_to_name -> assigned_to lookup (only if assigned_to not already set)
        const assignedToNameField = this.fieldMappings.find(m => m.appField === 'assigned_to_name');
        if (assignedToNameField?.excelColumn && row[assignedToNameField.excelColumn] && !record.assigned_to) {
          const userName = row[assignedToNameField.excelColumn].toString().trim();
          const userNameLower = userName.toLowerCase();
          console.log('Looking up user:', userName, '(lower:', userNameLower, ')');
          console.log('Users map keys:', Object.keys(this.usersMap));
          
          // Try exact match first (case-insensitive)
          let foundId = this.usersMap[userNameLower];
          console.log('Exact user match:', foundId);
          
          // Try partial match (first name or last name)
          if (!foundId) {
            const nameParts = userNameLower.split(' ');
            for (const part of nameParts) {
              if (part.length > 2) {
                foundId = this.usersMap[part];
                console.log('Partial user match on', part, ':', foundId);
                if (foundId) break;
              }
            }
          }
          
          // Try email match
          if (!foundId && userNameLower.includes('@')) {
            foundId = this.usersMap[userNameLower];
            console.log('Email user match:', foundId);
          }
          
          if (foundId) {
            record.assigned_to = foundId;
            console.log('User assigned:', foundId);
          }
        }

        // Ensure IDs are numbers (not 0 or empty strings)
        if (record.contact_id && record.contact_id > 0) {
          record.contact_id = parseInt(record.contact_id, 10);
        } else {
          delete record.contact_id;
        }
        if (record.company_id && record.company_id > 0) {
          record.company_id = parseInt(record.company_id, 10);
        } else {
          delete record.company_id;
        }
        if (record.assigned_to && record.assigned_to > 0) {
          record.assigned_to = parseInt(record.assigned_to, 10);
        } else {
          delete record.assigned_to;
        }
      }

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
      case 'sqr':
        observable = this.api.createSqr(data);
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
    // Pass the import result if import was completed, otherwise pass null
    this.modcl.dismiss(this.importResult);
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
