import '../app/globals.css';
import AuthProvider from '../context/AuthContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {

  return (
    <>
    <Head>
      <title>PantryPal</title>
      <link rel="icon" href="/images/pantry.png" /> {/* Make sure the favicon.ico is in your public directory */}
    </Head>

    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  </>
  );
}

export default MyApp;
