const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

// Watch the root dependencies needed by npm workspaces.
// The mobile projectRoot is watched automatically by Metro.
config.watchFolders = [
  path.resolve(workspaceRoot, 'node_modules'),
];

// Keep dependency resolution inside the mobile and root installations.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Do not follow symlinks outside the configured watch folders.
config.resolver.unstable_enableSymlinks = false;

module.exports = config;
