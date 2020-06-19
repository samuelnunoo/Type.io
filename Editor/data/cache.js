const NodeCache = require('node-cache')

class Cache {
  constructor (ttlSeconds) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: true })
  }

  get (key, storeFunction) {
    const value = this.cache.get(key)
    if (value) return Promise.resolve(value)

    return storeFunction().then(result => {
      this.cache.set(key, result)
      return result
    })
  }

  del (key) {
    this.cache.del(key)
  }

  flush () {
    this.cache.flushAll()
  }
}

module.exports = Cache
