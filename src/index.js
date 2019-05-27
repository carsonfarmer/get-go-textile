'use strict'
/*
  Download go-textile distribution package for desired version, platform and architecture,
  and unpack it to a desired output directory.

  API:
    download([<version>, <platform>, <arch>, <outputPath>])

  Defaults:
    go-textile version: value in package.json/go-textile/version
    go-textile platform: the platform this program is run from
    go-textile architecture: the architecture of the hardware this program is run from
    go-textile install path: './go-textile'

  Example:
    const download = require('get-go-textile')

    download("v0.2.1", "linux", "amd64", "/tmp/go-textile"])
      .then((res) => console.log('filename:', res.file, "output:", res.dir))
      .catch((e) => console.error(e))
*/
const goenv = require('go-platform')
const gunzip = require('gunzip-maybe')
const path = require('path')
const tarFS = require('tar-fs')
const unzip = require('unzip-stream')
const fetch = require('node-fetch')
const pkg = require('./../package.json')
const Octokit = require('@octokit/rest')
const octokit = Octokit()
const jp = require('jsonpath')

function unpack ({ url, installPath, stream }) {
  return new Promise((resolve, reject) => {
    if (url.endsWith('.zip')) {
      return stream.pipe(
        unzip
          .Extract({ path: installPath })
          .on('close', resolve)
          .on('error', reject)
      )
    }

    return stream
      .pipe(gunzip())
      .pipe(
        tarFS
          .extract(installPath)
          .on('finish', resolve)
          .on('error', reject)
      )
  })
}

async function download ({ installPath, url }) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Unexpected status: ${res.status}`)
  return unpack({ url, installPath, stream: res.body })
}

function cleanArguments (version, platform, arch, installPath) {
  const goTextileInfo = pkg['go-textile']

  const goTextileVersion = (goTextileInfo && goTextileInfo.version)
    ? pkg['go-textile'].version
    : 'next'

  return {
    version: version || process.env.TARGET_VERSION || goTextileVersion,
    platform: platform || process.env.TARGET_OS || goenv.GOOS,
    arch: arch || process.env.TARGET_ARCH || goenv.GOARCH,
    installPath: path.join(installPath ? path.resolve(installPath) : process.cwd(), 'go-textile')
  }
}

module.exports = async function () {
  const args = cleanArguments(...arguments)
  try {
    const settings = { owner: 'textileio', repo: 'go-textile' }
    const { data } = args.version === 'next'
      ? await octokit.repos.getLatestRelease(settings)
      : await octokit.repos.getReleaseByTag({
        ...settings,
        tag: args.version
      })
    const query = jp.query(data, `$.assets[?(@.name.startsWith("go-textile_${args.version}_${args.platform}-${args.arch}"))]`)
    if (query.length < 1) {
      throw new Error(`Missing release ${args.version} for ${args.platform}-${args.arch}`)
    }
    const first = query[0]
    const url = first.browser_download_url

    process.stdout.write(`Downloading ${url}\n`)

    await download({ ...args, url })

    return {
      fileName: first.name,
      installPath: args.installPath + path.sep
    }
  } catch (err) {
    throw new Error(`Unable to access requested release: ${err.toString()}`)
  }
}
