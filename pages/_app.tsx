import '@mantine/core/styles.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { SessionProvider } from 'next-auth/react';
import { DataContextProvider } from '@/public/static/DataContext/DataContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
    <SessionProvider session={pageProps.session}>
      <DataContextProvider>
        <MantineProvider theme={theme}>
          <Head>
            <title>BSLT Fire Recovery Monitoring</title>
            <meta
              name="viewport"
              content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
            />
            <link rel="shortcut icon" href="/BSLTLogo.png" />
          </Head>
          <Component {...pageProps} />
        </MantineProvider>
      </DataContextProvider>
    </SessionProvider>
    </>
  );
}
