import { Button, Grid, Input } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { PublicKey, Transaction } from '@solana/web3.js';

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexDirection: 'column',
      flexGrow: 1,
    },
    input: {
      width: 500,
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    button: {
      width: 100,
      padding: 'auto'
    }
  }),
);

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  autoApprove: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<void>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<any>;
}

const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    console.log('found')
    const provider = (window as any).solana;
    console.log(provider)
    if (provider.isPhantom) {
      return provider;
    }
  }
  window.open("https://phantom.app/", "_blank");
};

export const Wallets: React.FC = () => {
  const provider = getProvider();
  useEffect(() => {
    if (provider) {
      // try to eagerly connect
      provider.connect({ onlyIfTrusted: true });
      return () => {
        provider.disconnect();
      };
    }
  }, [provider]);
  const classes = useStyles();
  const [text, setText] = useState('');
  const [signed, setSigned] = useState('');
  const transaction = new Transaction();
  const onTextChange = (e: any) => {
    setText(e.target.value)
  }
  const signText = async () => {
    if (provider !== undefined) {
      await provider.connect()
    }
  }
  // await phantomWalletAdapter.connect();
  return (
    <Grid className={classes.root} container spacing={9} >
      <Grid item>
        <Input
          className={classes.input}
          defaultValue={provider && provider.publicKey ? provider.publicKey : ''}
          disabled
        />
      </Grid>
      <Grid item>
        <Input
          className={classes.input}
          value={text}
          onChange={onTextChange}
        />
      </Grid>
      <Grid item>
        <Input
          className={classes.input}
          disabled
          value={signed}
        />
      </Grid>
      <Grid>
        <Button className={classes.button} onClick={() => provider?.connect()}>Connect Wallet</Button>
      </Grid>
      <Grid>
        <Button className={classes.button} onClick={signText}>Sign</Button>
      </Grid>
    </Grid>
  );
};
