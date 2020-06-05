import Vue from 'vue'
const newPage = require('../../../Editor/data/model').newPage
const Plugins = require('./plugins')

Vue.prototype.$NewEditor = async function (editor) {
  const data = await newPage(editor, Plugins)
  return data
}
