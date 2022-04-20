import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { canvasClient } from '../lib/canvasClient';

type ListProps = { paths: Array<{ id?: string; slug: string; name?: string }> };

export default function Home({ paths }: ListProps) {
  return (
    <div>
      <Head>
        <title>Landing</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ul>
        {paths.map((path) => (
          <li key={path.id}>
            {path.slug ? (
              <Link href={path.slug}>
                <a>{path.name ?? path.slug}</a>
              </Link>
            ) : (
              <>{path.name} (no slug)</>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getStaticProps: GetStaticProps<ListProps> = async () => {
  const pages = await canvasClient.getCompositionList();
  return {
    props: {
      paths: pages.compositions
        .filter((comp) => comp.composition._slug)
        .map((comp) => ({
          id: comp.composition._id,
          slug: comp.composition._slug!,
          name: comp.composition._name,
        })),
      fallback: false,
    },
  };
};
