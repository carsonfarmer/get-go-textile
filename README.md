Install a Textile daemon as a dependency of your project
========================================================


> Install the latest [go-textile](https://github.com/textileio/go-textile/) binary

# Installation

```
yarn add go-textile
```

## Development

**Warning**: The binary gets put in the `go-textile` folder inside the module folder.

### Which version of go-textile will this package download?

Can be specified in `package.json` with a field `go-textile.version`, eg:

```json
"go-textile": {
  "version": "v0.2.1"
},
```

If left blank, it will default to the latest `go-textile` release.

### Arguments

When used via `node src/bin.js`, you can specify the target platform, version and architecture via environment variables: `TARGET_OS`, `TARGET_VERSION` and `TARGET_ARCH`.

We fetch the versions dynamically from `https://github.com/textileio/go-textile/releases` and the OSes and architectures are listed as Assets. You can also fetch specific versions via command line arguments in the order of:

```
node src/bin.js <version> <platform> <architecture> <install directory>
```

```
node src/bin.js v0.2.1 linux amd64 ./go-textile
```

## About

This is a direct fork of the [`npm-go-ipfs-dep`](https://github.com/ipfs/npm-go-ipfs-dep) library. Big thanks to all the contributors to that original package! See `package.json`, `LICENSE`, and `CHANGELOG.md` for details and contributions.
