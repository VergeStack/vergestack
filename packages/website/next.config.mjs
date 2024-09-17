import { remarkInstall } from 'fumadocs-docgen';
import createMDX from 'fumadocs-mdx/config';

const withMDX = createMDX({
  mdxOptions: {
    remarkPlugins: [remarkInstall]
  }
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/docs/api',
        permanent: false
      }
    ];
  }
};

export default withMDX(config);
