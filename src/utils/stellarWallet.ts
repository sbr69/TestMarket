import {
  allowAllModules,
  sep43Modules,
  StellarWalletsKit,
  WalletNetwork,
  type IModalTheme,
  type ModuleInterface,
} from '@creit.tech/stellar-wallets-kit';
import { LedgerModule } from '@creit.tech/stellar-wallets-kit/modules/ledger.module';
import { TrezorModule } from '@creit.tech/stellar-wallets-kit/modules/trezor.module';
import {
  WalletConnectAllowedMethods,
  WalletConnectModule,
} from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module';

const network = WalletNetwork.TESTNET;
const modalTheme: IModalTheme = {
  bgColor: '#ffffff',
  textColor: '#374151',
  solidTextColor: '#111827',
  headerButtonColor: '#1B1F5E',
  dividerColor: '#e5e7eb',
  helpBgColor: '#f9fafb',
  notAvailableTextColor: '#6b7280',
  notAvailableBgColor: '#f9fafb',
  notAvailableBorderColor: '#e5e7eb',
};

function supportedStellarWalletModules(): ModuleInterface[] {
  // The Kit's documented helper includes Albedo, Freighter, Rabet, xBull,
  // Lobstr, Hana, HOT Wallet, and Klever — all Stellar wallet integrations.
  const modules: ModuleInterface[] = [...allowAllModules(), new LedgerModule()];

  // Trezor requires an application contact address. Do not invent one: enable it
  // only when the deploy environment provides the real support address.
  const trezorEmail = import.meta.env.VITE_TREZOR_EMAIL?.trim();
  if (trezorEmail) {
    modules.push(new TrezorModule({
      appName: 'TestMarket',
      appUrl: import.meta.env.VITE_APP_URL?.trim() || 'https://test-market-theta.vercel.app',
      email: trezorEmail,
      lazyLoad: true,
    }));
  }

  // WalletConnect is a Stellar transport, but its SDK requires a project ID.
  const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();
  if (walletConnectProjectId) {
    modules.push(new WalletConnectModule({
      projectId: walletConnectProjectId,
      name: 'TestMarket',
      description: 'TestMarket Stellar testnet checkout',
      url: import.meta.env.VITE_APP_URL?.trim() || 'https://test-market-theta.vercel.app',
      icons: [],
      method: WalletConnectAllowedMethods.SIGN,
      network,
    }));
  }

  return modules;
}

// The Kit documentation recommends one long-lived instance per configured flow.
const checkoutWalletKit = new StellarWalletsKit({
  network,
  selectedWalletId: 'freighter',
  modules: supportedStellarWalletModules(),
  modalTheme,
});

// Server wallet login verifies a SEP-43 signed message. Only expose wallets that
// explicitly implement that standard, rather than letting a user select one that
// cannot complete a secure login.
const authWalletKit = new StellarWalletsKit({
  network,
  selectedWalletId: 'freighter',
  modules: sep43Modules(),
  modalTheme,
});

function openWalletModal(kit: StellarWalletsKit): Promise<{ address: string }> {
  return new Promise((resolve, reject) => {
    void kit.openModal({
      onWalletSelected: async ({ id }) => {
        try {
          kit.setWallet(id);
          resolve(await kit.getAddress());
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Unable to connect the selected Stellar wallet.'));
        }
      },
      onClosed: (error) => reject(error ?? new Error('Wallet connection was cancelled.')),
    }).catch((error: unknown) => {
      reject(error instanceof Error ? error : new Error('Unable to open the Stellar wallet picker.'));
    });
  });
}

/** Opens the full Stellar wallet picker for checkout and transaction signing. */
export function connectStellarWallet(): Promise<{ address: string }> {
  return openWalletModal(checkoutWalletKit);
}

/** Opens the SEP-43-compatible Stellar wallet picker for secure wallet login. */
export function connectStellarAuthWallet(): Promise<{ address: string }> {
  return openWalletModal(authWalletKit);
}

export async function signStellarMessage(message: string, address: string): Promise<{ signedMessage: string }> {
  const { signedMessage } = await authWalletKit.signMessage(message, {
    address,
    networkPassphrase: network,
  });
  if (!signedMessage) throw new Error('The Stellar wallet did not return a signature.');
  return { signedMessage };
}

export async function signStellarTransaction(xdr: string, address: string): Promise<{ signedTxXdr: string }> {
  const { signedTxXdr } = await checkoutWalletKit.signTransaction(xdr, {
    address,
    networkPassphrase: network,
  });
  if (!signedTxXdr) throw new Error('The Stellar wallet did not return a signed transaction.');
  return { signedTxXdr };
}
