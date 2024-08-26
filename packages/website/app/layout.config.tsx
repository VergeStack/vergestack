import Logo from '@/app/assets/logo.png';
import { pageTree } from '@/app/source';
import { type HomeLayoutProps } from 'fumadocs-ui/home-layout';
import { type DocsLayoutProps } from 'fumadocs-ui/layout';
import Image from 'next/image';
import { IoLogoGithub } from 'react-icons/io5';

// shared configuration
export const baseOptions: HomeLayoutProps = {
  nav: {
    title: (
      <>
        <Image src={Logo} alt="VergeStack" width={48} />
        <span>VergeStack</span>
      </>
    )
  },
  links: [
    {
      text: 'GitHub',
      url: 'https://github.com/vergestack',
      icon: <IoLogoGithub />
    }
  ]
};

// docs layout configuration
export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: pageTree
};
