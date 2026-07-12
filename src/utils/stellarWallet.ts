import {
  StellarWalletsKit,
  Networks,
} from '@creit.tech/stellar-wallets-kit';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import type { SwkAppTheme } from '@creit.tech/stellar-wallets-kit/types';

const customTheme: SwkAppTheme = {
  background: '#ffffff',
  'background-secondary': '#f9fafb',
  'foreground-strong': '#111827',
  foreground: '#374151',
  'foreground-secondary': '#6b7280',
  primary: '#1B1F5E', // matches website brand blue
  'primary-foreground': '#ffffff',
  transparent: 'transparent',
  lighter: '#f3f4f6',
  light: '#e5e7eb',
  'light-gray': '#f3f4f6',
  gray: '#9ca3af',
  danger: '#ef4444',
  border: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.08) 0px 4px 12px',
  'border-radius': '1rem', // matches rounded-2xl theme
  'font-family': '"Inter", ui-sans-serif, system-ui, sans-serif',
};

StellarWalletsKit.init({
  network: Networks.TESTNET,
  selectedWalletId: 'freighter',
  modules: [
    new AlbedoModule(),
    new FreighterModule(),
    new LobstrModule(),
    new xBullModule(),
  ],
  theme: customTheme,
  authModal: {
    showInstallLabel: true,
    hideUnsupportedWallets: false,
  }
});

export { StellarWalletsKit };
