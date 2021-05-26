import '../styles/globals.css'
import 'lite-react-ui/css';

function MyApp({ Component, pageProps }) {
  return <div className="relative min-h-screen flex"><Component {...pageProps} /></div>;
}

export default MyApp
