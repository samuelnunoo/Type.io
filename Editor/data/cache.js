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

  async storage (_id, Schema) {
    const value = this.cache.get(_id)
    if (value) return await value

    const model = await Schema.findOne({ _id }).exec()
    this.cache.set(_id, model)
    return model
  }

  del (key) {
    this.cache.del(key)
  }
  flush () {
    this.cache.flushAll()
  }
}

module.exports = Cache
