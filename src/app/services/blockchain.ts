import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import Web3 from 'web3';
import { ABI_CONTRACT } from '../contract-abi';
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: "PINATA_JWT",
  pinataGateway: "PINATA_GATEWAY",
});

declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  public web3: Web3 | undefined;
  public accounts: string[] = [];
  public accountChanged = new Subject<string[]>();
  public issuerAddress: string | null = null;
  public contract: any = undefined;

  constructor(private zone: NgZone) {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.zone.run(() => {
          this.accounts = accounts;
          this.accountChanged.next(accounts);
        });
      });
    }
  }

  loadContract(receiverAddress: string): void {
    if (!this.web3) return;
    this.contract = new this.web3.eth.Contract(ABI_CONTRACT, receiverAddress);
  }

  async connectWallet(): Promise<void> {
    if (window.ethereum) {
      try {
        this.accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.accountChanged.next(this.accounts);
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      console.warn("MetaMask or other Web3 wallet not detected.");
    }
  }

  async uploadPinata(file: any): Promise<any> {
    try {
      const filePinata = file;
      const upload = await pinata.upload.public.file(filePinata);
      return upload;
    } catch (error) {
      console.log(error);
    }
  }

  async retrieveFilePinata(cid:string): Promise<any> {
    try {
      const data = await pinata.gateways.public.get(cid);
      return data
    } catch (error) {
      console.log(error);
    }
  }

  async sendToken(receiverAddress: string, docName: string, description: string, ipfsAddress: string, docType: number): Promise<void> {
    await this.contract.methods.registerDocument(receiverAddress, docName, description, ipfsAddress, docType).send({ from: this.accounts[0] });
  }
}