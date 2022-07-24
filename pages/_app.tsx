import "../styles/globals.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import Link from "next/link";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <div>
        <Link href="/">Main Page</Link>
        <Link href="/test">TEST PAGE</Link>
      </div>
      <Component {...pageProps} />
    </RecoilRoot>
  );
}

export default MyApp;
