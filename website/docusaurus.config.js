// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'tech2026',
  tagline: 'Interview prep for 2026',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://lelea2.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/tech2026/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'lelea2', // Usually your GitHub org/user name.
  projectName: 'tech2026', // Usually your repo name.

  onBrokenLinks: 'ignore',

  // 1. Enable the markdown feature
  markdown: {
    mermaid: true,
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    function webpackAlias() {
      return {
        name: 'custom-webpack-alias',
        configureWebpack() {
          return {
            resolve: {
              alias: {
                '@': path.resolve(__dirname, 'src'),
              },
            },
          };
        },
      };
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          exclude: ['tutorial-basics/**', 'tutorial-extras/**'],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/lelea2/tech2026/tree/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      navbar: {
        title: 'tech2026',
        logo: {
          alt: 'tech2026 Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/docs/algorithm',
            position: 'left',
            label: 'Algorithm',
          },
          {
            to: '/docs/backend',
            position: 'left',
            label: 'BackEnd',
          },
          {
            to: '/docs/frontend/jsfunction',
            position: 'left',
            label: 'FrontEnd',
          },
          {
            to: '/docs/ml',
            position: 'left',
            label: 'ML',
          },
          {
            to: '/docs/behavioral',
            position: 'left',
            label: 'Behavioral',
          },
          {
            to: '/docs/system-designs',
            position: 'left',
            label: 'System Design',
          },
          {
            to: '/docs/company',
            position: 'left',
            label: 'Company',
          },
          {
            href: 'https://github.com/lelea2/tech2026',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} tech2026. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
