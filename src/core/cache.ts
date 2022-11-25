import fs from "fs";
import path from "path";
import crypto from 'crypto'
import BJSON from 'buffer-json'

import pkg from '../../package.json'
const env = process.env.NODE_ENV || 'development';

const root = process.cwd()
const cacheDirectory = path.join(root, 'node_modules', '.cache', 'unplugin-imagemin');
const cacheIdentifier = `unplugin-imagemin:${pkg.version} ${env}`;
const manifestKey = path.join(cacheDirectory, 'manifest.json')

export default class Cache {
	mainfest: any;

	constructor () {
		this.mainfest = readManifest()
	}
	get (chunk) {
		if (!this.hasManifest(chunk.name)) {
			return null
		}
		const originStats = fs.statSync(path.join(root, chunk.name));
		const cacheStats = this.getManifest(chunk.name);
		if (originStats.ctimeMs === cacheStats.ctimeMs) {
			return readSync(cacheKey(chunk.name))
		}
		return null
	}
	set (chunk, data) {
		if (!existsSync(cacheDirectory)) {
			mkdirSync(cacheDirectory);
		}
		writeSync(cacheKey(chunk.name), data || chunk.source);
		this.setManifest(chunk.name, fs.statSync(path.join(root, chunk.name)))
	}
	getManifest (key) {
		return this.mainfest[key]
	}
	setManifest (key, value) {
		this.mainfest[key] = value
		writeSync(manifestKey, this.mainfest);
	}
	hasManifest (key) {
		return !!this.mainfest[key]
	}
}

function readManifest() {
	if (!existsSync(manifestKey)) {
		return {}
	}
	const content = readSync(manifestKey) || {}
	return content
}

function cacheKey(key) {
	const hash = digest(`${cacheIdentifier}\n${key}`);
	return path.join(cacheDirectory, `${hash}.json`);
}

function writeSync(key, data) {
  const content = BJSON.stringify(data);
  fs.writeFileSync(key, content, 'utf-8');
}

function readSync(key) {
  const content = fs.readFileSync(key, 'utf-8');
  return BJSON.parse(content);
}

function existsSync(path) {
	return fs.existsSync(path)
}

function mkdirSync(path) {
	fs.mkdirSync(path, { recursive: true })
}

function digest(str) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
}
