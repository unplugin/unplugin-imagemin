import fs from "fs";
import path from "path";
import crypto from 'crypto'

import pkg from '../../package.json'
const env = process.env.NODE_ENV || 'development';

const root = process.cwd()
const cacheDirectory = path.join(root, 'node_modules', '.cache', 'unplugin-imagemin');
const cacheIdentifier = `unplugin-imagemin:${pkg.version} ${env}`;
const manifestKey = path.join(cacheDirectory, 'manifest.json')

export default class Cache {
	mainfest: any;
	outputPath: string;

	constructor ({ outputPath }) {
		this.outputPath = outputPath
		this.mainfest = getCacheManifest()
	}
	get (chunk) {
		const cacheKey = getCacheKey(chunk)
		if (!this.hasManifest(cacheKey)) {
			return null
		}
		const originStats = fs.statSync(path.join(root, chunk.name));
		const cacheStats = this.getManifest(cacheKey);
		if (originStats.ctimeMs === cacheStats.ctimeMs) {
			return fs.readFileSync(cacheKey)
		}
		return null
	}
	set (chunk, data) {
		const cacheKey = getCacheKey(chunk)
		if (!existsSync(cacheDirectory)) {
			mkdirSync(cacheDirectory);
		}
		fs.writeFileSync(cacheKey, data || fs.readFileSync(path.join(this.outputPath, chunk.fileName)));
		this.setManifest(cacheKey, fs.statSync(path.join(root, chunk.name)));
	}
	getManifest (key: string) {
		return this.mainfest[key]
	}
	setManifest (key: string, value: object) {
		this.mainfest[key] = value;
		fs.writeFileSync(manifestKey, JSON.stringify(this.mainfest), 'utf-8');
	}
	hasManifest (key: string) {
		return !!this.mainfest[key]
	}
}

function getCacheManifest(): object {
	if (!existsSync(manifestKey)) {
		return {}
	}
	const content = JSON.parse(fs.readFileSync(manifestKey, 'utf-8')) || {}
	return content
}

function getCacheKey(chunk): string {
	const hash = digest(`${cacheIdentifier}\n${chunk.name}`);
	return path.join(cacheDirectory, `${hash}`);
}

function existsSync(path: string): boolean {
	return fs.existsSync(path)
}

function mkdirSync(path: string): void {
	fs.mkdirSync(path, { recursive: true })
}

function digest(str: string): string {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
}
