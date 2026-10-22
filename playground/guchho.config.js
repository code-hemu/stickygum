export default {
  build: {
    // Every page of the playground is an entry of its own. They are all in this
    // directory because a page cannot be written to a subdirectory of the
    // output: the name of an entry loses its path separators.
    entry: ['index.html', '3-columns.html', '4-columns.html'],
    outdir: 'dist',
    target: 'esnext',
    minify: false,
    pretty: true,
    minifyHtml: false,
    define: { __DEV__: 'false' },
  },
};
