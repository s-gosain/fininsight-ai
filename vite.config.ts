server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: {
        host: '0.0.0.0',
        port: 3000,
        clientPort: 3000,
      },
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 4000,
    },
  };
});
