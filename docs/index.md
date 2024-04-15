---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "tauri-plugin-clipboard"
  text: "Documentation"
  tagline: A clipboard plugin for Tauri
  actions:
    - theme: brand
      text: Introduction
      link: /intro
    - theme: alt
      text: API Examples
      link: /api-examples

features:
  - title: Text
    details: Access clipboard plain text
  - title: Image
    details: Access clipboard image/screenshot
  - title: HTML
    details: Access clipboard HTML (e.g. copy from browser or code editor with styling)
  - title: RTF
    details: Access clipboard rich text (e.g. copy from Office Word)
  - title: Files
    details: Access clipboard files URL (e.g. copy from file explorer)
  - title: Watcher
    details: Monitor clipboard changes (gets notified when clipboard content changes)
---
