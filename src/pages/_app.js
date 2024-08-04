import '../app/globals.css';
import AuthProvider from '../context/AuthContext';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
