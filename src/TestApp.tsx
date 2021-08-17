import { useState, useEffect } from "react";
import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import "./styles.css";
import { Button, createStyles, Grid, Input, makeStyles, Theme } from "@material-ui/core";

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

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
    const provider = (window as any).solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  window.open("https://phantom.app/", "_blank");
};

export const Wallet = () => {
  const [signed, setSigned] = useState('');
  const [text, setText] = useState('');
  const classes = useStyles();
  const provider = getProvider();
  console.log(provider)
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (log: string) => setLogs([...logs, log]);
  const [, setConnected] = useState<boolean>(false);
  useEffect(() => {
    if (provider) {
      provider.on("connect", () => {
        setConnected(true);
        addLog("Connected to wallet " + provider.publicKey?.toBase58());
      });
      provider.on("disconnect", () => {
        setConnected(false);
        addLog("Disconnected from wallet");
      });
      // try to eagerly connect
      provider.connect({ onlyIfTrusted: true });
      return () => {
        provider.disconnect();
      };
    }
  }, [provider]);
  if (!provider) {
    return <h2>Could not find a provider</h2>;
  }
  const signMessage = async () => {
    const data = new TextEncoder().encode(text);
    const signedMessage = await provider.signMessage(data);
    console.log(signedMessage)
    setSigned(signedMessage.signature.toString());
    addLog("Message signed");
  };
  const onTextChange = (e: any) => {
    setText(e.target.value)
  }
  return (
    <div>
      {
        provider && provider.publicKey ? (
          <Grid className={classes.root} container spacing={9} >
            <Grid item>
              <Input
                className={classes.input}
                defaultValue={provider.publicKey?.toBase58() ? provider.publicKey?.toBase58() : ''}
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
              <Button className={classes.button} onClick={() => signMessage() }>Sign</Button>
            </Grid>
          </Grid>
        ) : (
          <>
            <button onClick={() => provider.connect()}>
              Connect to Phantom
            </button>
          </>
        )
      }
    </div>
  );
}
