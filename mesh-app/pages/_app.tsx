import '../styles/global.css';
import type { AppProps } from 'next/app';
import { UniformMeshSdkContextProvider, useInitializeUniformMeshSdk } from '@uniformdev/mesh-sdk-react';

function App({ Component, pageProps }: AppProps) {
  const { initializing, error } = useInitializeUniformMeshSdk();

  if (error) {
    throw error;
  }

  return initializing ? null : (
    <UniformMeshSdkContextProvider>
      <Component {...pageProps} />
    </UniformMeshSdkContextProvider>
  );
}

export default App;
