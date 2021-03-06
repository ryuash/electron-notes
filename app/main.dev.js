/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
const db = require('electron-db');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const os = require('os');

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  //checking if path needed for db exist if not make it before making the db
  const platform = os.platform();

  let appName = '';
  if (JSON.parse(fs.readFileSync('package.json', 'utf-8')).productName) {
    appName = JSON.parse(fs.readFileSync('package.json', 'utf-8')).productName;
  } else {
    appName = JSON.parse(fs.readFileSync('package.json', 'utf-8')).name;
  }

  let userData = '';

  if (platform === 'win32') {
    userData = path.join(process.env.APPDATA, appName);
  } else if (platform === 'darwin') {
    userData = path.join(
      process.env.HOME,
      'Library',
      'Application Support',
      appName
    );
  } else {
    userData = path.join('var', 'local', appName);
  }

  if (!fs.existsSync(userData)) {
    mkdirp(path.join(userData), function(err) {
      if (err) {
        console.log(err, 'error');
      }
    });
  }
  //initilizing a json db on ready
  db.createTable('notes', (succ, msg) => {
    // succ - boolean, tells if the call is successful
    console.log('Success: ' + succ);
    console.log('Message: ' + msg);
  });

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
});
