import { Component, signal, computed, inject, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { BlockchainService } from './services/blockchain';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    CommonModule,
    NgxFileDropModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  providers: [
    BlockchainService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  private readonly fb = inject(FormBuilder);
  public files: NgxFileDropEntry[] = [];
  public selectedFile: File | null = null;
  private _snackBar = inject(MatSnackBar);
  protected readonly isLoading = signal<boolean>(false);

  // Formulário de dados do paciente e tipo de documento
  protected readonly receiverForm = this.fb.group({
    receiverAddress: ['', [Validators.required]],
  });

  // Formulário dpara download do arquivo
  protected readonly downloadForm = this.fb.group({
    cid: ['', [Validators.required]],
  });

  protected readonly docForm = this.fb.group({
    docName: ['', [Validators.required]],
    docType: ['', [Validators.required]],
    description: ['', [Validators.required]]
  });

  // Signals para arquivo, preview, hash, CID, permissões, etc.
  protected readonly file = signal<File | null>(null);
  protected readonly filePreview = signal<string | null>(null);
  protected readonly isImage = computed(() => {
    const f = this.file();
    return !!f && f.type.startsWith('image/');
  });
  // protected readonly selectedFile = computed(() => this.file());
  protected readonly fileHash = signal<string | null>(null);
  protected readonly ipfsCid = signal<string | null>(null);

  // Metadados simulados
  protected readonly timestamp = Date.now();

  // Permissões simuladas
  protected readonly permissionsSummary = 'Hospital, Laboratório, Seguradora';

  balance: string = '0';
  protected readonly connectedAccount = signal<string | undefined>(undefined);
  constructor(private blockchainService: BlockchainService) { }

  ngOnInit(): void {
    this.blockchainService.accountChanged.subscribe(accounts => {
      this.connectedAccount.set(accounts.length > 0 ? accounts[0] : undefined);
      console.log('Contas conectadas:', accounts);
    });
  }

  async connect(): Promise<void> {
    await this.blockchainService.connectWallet();
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.selectedFile = file;
        });
      }
    }
  }

  public fileOver(event: any) {
    console.log('Arquivo sobre a área', event);
  }

  public fileLeave(event: any) {
    console.log('Arquivo saiu da área', event);
  }

  public loadContract() {
    this.blockchainService.loadContract(this.receiverForm.value.receiverAddress!);
  }

  async sendToken() {
    this.isLoading.set(true)
    const uploadedFile: any = await this.blockchainService.uploadPinata(this.selectedFile);
    await this.blockchainService.sendToken(this.receiverForm.value.receiverAddress!, this.docForm?.value?.docName!, this.docForm?.value?.description!, uploadedFile?.cid, parseInt(this.docForm?.value?.docType!)).then(() => {
      this.isLoading.set(false)
      this._snackBar.open('Documento registrado com sucesso na blockchain!', 'Fechar');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }).catch((error: any) => {
      this.isLoading.set(false)
      console.error('Erro ao registrar documento:', error);
      this._snackBar.open('Erro ao registrar documento na blockchain.', 'Fechar');
    });

  }

  public async retrieveFilePinata() {
    this.isLoading.set(true);
    try {
      const blob = await this.blockchainService.retrieveFilePinata(this.downloadForm.value.cid!);
      const url = URL.createObjectURL(blob?.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arquivo_' + this.downloadForm.value.cid + '.pdf'; // ajuste o nome se quiser
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this._snackBar.open('Download iniciado!', 'Fechar');
    } catch (error) {
      this._snackBar.open('Erro ao baixar arquivo.', 'Fechar');
    } finally {
      this.downloadForm.get('cid')?.reset();
      this.isLoading.set(false);
    }
  }
}