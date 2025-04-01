const express = require('express');
const path = require('path');
const router = express.Router();
const fs = require('fs');

const serverModulePath = path.join(
    __dirname,
    '..',  // remonte dans le dossier backend
    '..',  // remonte à la racine du projet
    'frontend-angular',
    'dist',
    'frontend-angular',
    'server',
    'main.server.mjs'
);

const { AppServerModule, renderModule } = require(serverModulePath);

const { ɵCommonEngine } = require('@nguniversal/common/engine');


const distBrowserFolder = path.join(__dirname, 'dist', 'frontend-angular', 'browser');
const indexHtml = fs.readFileSync(path.join(distBrowserFolder, 'index.html')).toString();

router.use(express.static(distBrowserFolder, {
    maxAge: '1y'
}));

router.get('*', async (req, res) => {
    try {
        // Rendu SSR via Angular Universal
        const html = await ɵCommonEngine({
            bootstrap: AppServerModule,
            document: indexHtml,
            url: req.originalUrl,
            publicPath: distBrowserFolder
        })(req, res);

        res.status(200).send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur interne du serveur');
    }
});

module.exports = router;
