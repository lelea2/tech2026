// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import path from 'path';
import {fileURLToPath} from 'url';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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
    faster: {
      rspackBundler: false, // temporarily disabled to isolate hang
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      mdxCrossCompilerCache: true,
      rspackPersistentCache: false,
      ssgWorkerThreads: true,
      gitEagerVcs: true,
    },
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
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/lelea2/tech2026/tree/main/website/',
          async sidebarItemsGenerator({defaultSidebarItemsGenerator, ...args}) {
            const items = await defaultSidebarItemsGenerator(args);
            function sortItems(list) {
              const categories = list
                .filter((item) => item.type === 'category')
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((item) => ({
                  ...item,
                  items: sortItems(item.items ?? []),
                }));
              const docs = list
                .filter((item) => item.type !== 'category')
                .sort((a, b) => {
                  const labelA = a.label ?? a.id ?? '';
                  const labelB = b.label ?? b.id ?? '';
                  return labelA.localeCompare(labelB);
                });
              return [...categories, ...docs];
            }
            return sortItems(items);
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV',
      crossorigin: 'anonymous',
    },
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
            to: '/docs/category/frontend-system-design',
            position: 'left',
            label: 'Frontend System Design',
          },
          {
            to: '/docs/ml',
            position: 'left',
            label: 'ML',
          },
          {
            to: '/docs/category/behavioral',
            position: 'left',
            label: 'Behavioral',
          },
          {
            to: '/docs/category/system-design',
            position: 'left',
            label: 'System Design',
          },
          {
            to: '/docs/category/company',
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
