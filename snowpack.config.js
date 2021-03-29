module.exports = {
    packageOptions: {
        "source": "remote"
    },
    mount: {
        public: '/',
        src: '/_dist_',
    },
    plugins: [
        "@snowpack/plugin-postcss",
        // Enable if Tailwind components are needed
        // Refer to /dist/styles.css in index.html, if you do so...
        // [
        //     "@snowpack/plugin-run-script",
        //     {
        //         "cmd": "postcss src/styles/index.css -o dist/styles.css",
        //         "watch": "postcss src/styles/index.css -o dist/styles.css -w"
        //     }
        // ],
        ["./plugins/posthtml-snowpack-plugin.js", {/* pluginOptions */ }],
    ],
    "devOptions": {
        "port": 3000,
        "open": "none",
        "bundle": false
    },
    "optimize": {
        "bundle": true,
        "minify": true,
        "target": 'es2020'
    },
};