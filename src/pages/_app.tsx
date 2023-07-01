import { useState } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import { getCookie, setCookie } from 'cookies-next';
import Head from 'next/head';
import { MantineProvider, ColorScheme, ColorSchemeProvider, DefaultMantineColor, Container } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { CustomHeader } from '@/components/Header/Header';
import { CustomFooter } from '@/components/Footer/Footer';
import '@/styles/styles.css';

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);
  const defaultColor: DefaultMantineColor = "pink";

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  };

  return (
    <>
      <Head>
        <title>Survey App</title>
        <meta name="description" content="App for polls" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>

      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{ 
          colorScheme: colorScheme, 
          primaryColor: defaultColor,
          defaultGradient: { deg: 45, from: defaultColor, to: `${defaultColor}.4` },
        }} withGlobalStyles withNormalizeCSS>

          <Container className="box">
            <CustomHeader/>
            <Container>
              <Component {...pageProps} />
            </Container>
            <CustomFooter/>
          </Container>
          
          <Notifications />
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie('mantine-color-scheme', appContext.ctx) || 'dark',
  };
};
