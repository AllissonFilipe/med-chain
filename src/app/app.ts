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
    NgxFileDropModule
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

  // Formulário de dados do paciente e tipo de documento
  protected readonly receiverForm = this.fb.group({
    receiverAddress: ['', [Validators.required]],
  });

  protected readonly docForm = this.fb.group({
    docName: ['', [Validators.required]],
    docType: ['', [Validators.required]]
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

  // Controle de envio
  protected readonly canSend = computed(() =>
    this.receiverForm.valid &&
    !!this.file() &&
    !!this.fileHash() &&
    !!this.ipfsCid()
  );
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

  // Cálculo de hash SHA-256 do arquivo
  private async calculateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Simulação de upload para IPFS (gera CID fake)
  private async uploadToIpfs(file: File): Promise<string> {
    // Simule um delay e retorne um CID fake
    await new Promise(res => setTimeout(res, 800));
    return 'bafybeigdyrzt' + Math.floor(Math.random() * 100000);
  }

  // Manipulação do arquivo selecionado
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.file.set(file);
      // Preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => this.filePreview.set(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        this.filePreview.set(null);
      }
      // Calcule hash e simule upload IPFS
      this.fileHash.set(null);
      this.ipfsCid.set(null);
      this.fileHash.set(await this.calculateFileHash(file));
      this.ipfsCid.set(await this.uploadToIpfs(file));
    }
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.selectedFile = file;

          // Gerar preview
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => this.filePreview.set(reader.result as string);
            reader.readAsDataURL(file);
          } else {
            this.filePreview.set(null);
          }
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

  public upload() {
    if (this.selectedFile) {
      console.log('Enviando arquivo:', this.selectedFile);
      // aqui você faria a chamada HTTP para a sua API
    }
  }

  public loadContract() {
    this.blockchainService.loadContract(this.receiverForm.value.receiverAddress!);
  }

  // Envio do token (simulado)
  async sendToken() {
    await this.blockchainService.sendToken(this.receiverForm.value.receiverAddress!, this.docForm.value.docName!, 'ueifkjabhfeuwfhoiuewfiefufhiuewgf', parseInt(this.docForm.value.docType!)).then(() => {
      this._snackBar.open('Documento registrado com sucesso na blockchain!', 'Fechar');
      window.location.reload();
    }).catch((error: any) => {
      console.error('Erro ao registrar documento:', error);
      this._snackBar.open('Erro ao registrar documento na blockchain.', 'Fechar');
    });
  }
}