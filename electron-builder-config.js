const path = require('path');
const { rootPath } = require('electron-root-path');
// const { PATHS } = require('./src/constants/paths');

module.exports = () => {
  return {
    productName: 'OpenMTP',
    appId: 'io.ganeshrvel.openmtp',
    forceCodeSigning: true,
    artifactName: '${name}-${version}-${os}-${arch}.${ext}',
    copyright: '© Ganesh Rathinavel',
    afterPack: './internals/scripts/AfterPack.js',
    afterSign: './internals/scripts/Notarize.js',
    npmRebuild: false,
    publish: [
      {
        provider: 'github',
        owner: 'ganeshrvel',
        repo: 'openmtp',
        private: false,
      },
    ],
    files: [
      'app/dist/',
      'app/app.html',
      'app/main.prod.js',
      'app/main.prod.js.map',
      'package.json',
    ],
    extraFiles: [
      {
        from: 'build/mac/bin',
        to: 'Resources/bin',
        filter: ['**/*'],
      },
    ],

    ///extraResources: ['resources/**'],
    //     extraFiles: [
    //       {
    //         from: PATHS.tempPackagedDir,
    //         to: `Resources`,
    //         filter: ['**/*'],
    //       },
    //       {
    //         from: PATHS.splashScreenDistBundledHtml,
    //         to: `Resources`,
    //       },
    //     ],
    mac: {
      type: 'distribution',
      icon: 'build/icon.icns',
      category: 'public.app-category.productivity',
      hardenedRuntime: true,
      gatekeeperAssess: false,
      entitlements: './build/entitlements.mac.plist',
      entitlementsInherit: './build/entitlements.mac.plist',
      extendInfo: {
        LSMinimumSystemVersion: '10.11.0',
        NSDesktopFolderUsageDescription: 'Desktop folder access',
        NSDocumentsFolderUsageDescription: 'Documents folder access',
        NSDownloadsFolderUsageDescription: 'Downloads folder access',
        NSRemovableVolumesUsageDescription: 'Removable Disk access',
        NSPhotoLibraryUsageDescription: 'Photo library access',
      },
      target: {
        target: 'default',
      },
    },
    mas: {
      type: 'distribution',
      category: 'public.app-category.productivity',
      entitlements: 'build/entitlements.mas.plist',
      icon: 'build/icon.icns',
      binaries: ['dist/mas/OpenMTP.app/Contents/Resources/bin/mtp-cli'],
    },
    dmg: {
      contents: [
        {
          x: 130,
          y: 220,
        },
        {
          x: 410,
          y: 220,
          type: 'link',
          path: '/Applications',
        },
      ],
    },
    win: {
      target: ['nsis'],
    },
    linux: {
      target: ['deb', 'AppImage'],
      category: 'public.app-category.productivity',
    },
  };
};
