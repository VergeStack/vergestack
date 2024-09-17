import LogoTransparent from '@/app/assets/logo_transparent.png';
import { pageTree } from '@/app/source';
import { RootToggle } from 'fumadocs-ui/components/layout/root-toggle';
import { type HomeLayoutProps } from 'fumadocs-ui/home-layout';
import { type DocsLayoutProps } from 'fumadocs-ui/layout';
import { Cable, UserCircle } from 'lucide-react';
import Image from 'next/image';
import { ReactNode } from 'react';
import { IoLogoGithub } from 'react-icons/io5';

// shared configuration
export const baseOptions: HomeLayoutProps = {
  nav: {
    title: (
      <>
        <Image src={LogoTransparent} alt="VergeStack" width={36} />
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

function Icon({ children }: { children: ReactNode }) {
  return <div className="size-9 shrink-0 rounded-lg  p-1.5">{children}</div>;
}

// docs layout configuration
export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: pageTree,
  sidebar: {
    banner: (
      <RootToggle
        options={[
          {
            title: 'API',
            description: 'Typesafe requests',
            url: '/docs/api',
            icon: (
              <Icon>
                <Cable />
              </Icon>
            )
          },
          {
            title: 'Auth',
            description: 'Secure authentication',
            url: '/docs/auth',
            icon: (
              <Icon>
                <UserCircle />
              </Icon>
            )
          }
        ]}
      />
    )
  }
};
