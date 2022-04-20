import React from 'react';
import { GetStaticPaths, GetStaticPropsContext } from 'next';
import { enhance, RootComponentInstance } from '@uniformdev/canvas';
import { canvasClient } from '../lib/canvasClient';
import { enhancers } from '../lib/enhancers';

export default function Home({ composition }: { composition: RootComponentInstance }) {
  return (
    <div>
      <h2>Raw composition</h2>
      <pre>{JSON.stringify(composition, null, 2)}</pre>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await canvasClient.getCompositionList({
    skipEnhance: true,
  });

  return {
    paths: pages.compositions.map((c) => c.composition._slug!).filter((slug) => slug),
    fallback: false,
  };
};

export async function getStaticProps(context: GetStaticPropsContext) {
  const slug = context?.params?.slug ?? '';
  const slugString = Array.isArray(slug) ? slug.join('/') : slug;
  const { composition } = await canvasClient.getCompositionBySlug({
    slug: `/${slugString}`,
  });

  await enhance({ composition, enhancers, context });

  return {
    props: {
      composition,
    },
  };
}
