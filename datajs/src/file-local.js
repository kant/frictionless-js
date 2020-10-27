import chardet from 'chardet'
import fs from 'fs'
import { File } from './file-base'
import { computeHash } from './browser-utils/utils'
import path from 'path'

export class FileLocal extends File {
  get displayName() {
    return 'FileLocal'
  }

  get path() {
    return this._basePath
      ? path.join(this._basePath, this.descriptor.path)
      : this.descriptor.path
  }

  stream({ end } = {}) {
    return fs.createReadStream(this.path, { start: 0, end })
  }

  get size() {
    return fs.statSync(this.path).size
  }

  get encoding() {
    // When data is huge, we want to optimize performace (in tradeoff of less accuracy):
    // So we are using sample of first 100K bytes here:
    if (this.size > 1000000) {
      return chardet.detectFileSync(this.path, { sampleSize: 1000000 })
    }
    return chardet.detectFileSync(this.path)
  }

  /**
   * Calculates the hash of a file
   * @param {string} hashType - md5/sha256 type of hash algorithm to use
   */
  async hash(hashType='sha256') {
    return computeHash(this.stream(), this.size, hashType)
  }
}
