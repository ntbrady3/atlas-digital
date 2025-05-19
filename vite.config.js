export default {
  root: '.',
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
        projects: './projects.html',
        about: './about.html',
        contact: './contact.html',
		services: './services.html'
      }
    }
  }
}