import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "tauri-plugin-clipboard",
  description: "Documentation",
  base: "/tauri-plugin-clipboard",
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/api-examples' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/intro' },
          { text: 'Installation', link: '/installation' },
          { text: 'API Examples', link: '/api-examples' },
          { text: 'Notes', link: '/notes' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/CrossCopy/tauri-plugin-clipboard' }
    ]
  }
})
