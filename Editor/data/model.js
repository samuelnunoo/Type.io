// Imports
const db = require('./database')

const Schema = require('prosemirror-model').Schema
const EditorView = require('prosemirror-view').EditorView
const EditorState = require('prosemirror-state').EditorState
const state = require('prosemirror-state')
const Plugin = state.Plugin
const PluginKey = state.PluginKey
const updateKey = new PluginKey('updatePlugin')
const fs = require('fs')
const mongoose = require('mongoose')
const { Decoration, DecorationSet } = require('prosemirror-view')
const CacheService = require('../data/cache')
// Models
const nodeSpec = require('./Schema/nodeSpec')
const Page = require('./Schema/Page')
const Types = require('./Schema/Types')

// Cache Service
const ttl = 0
const cache = new CacheService(ttl)

// Schema Functions
let templates
async function getSchema () {
  const value = await cache.get('Schema', produceSchema)
  return value
}
async function produceSchema () {
  // Variables
  let result
  let node
  let content

  // Functions
  const sequence = [
    getNodeSpec,
    getItems,
    formatNode,
    setNode,
    docContent,
    setContent]
  function setContent (result) {
    content = result
  }
  function setNode (json) {
    node = json
    templates = json
    return json
  }
  for (const f of sequence) {
    result = await f(result)
  }

  // JSON
  const _json = schemaJSON(node, content)

  // Schema
  const schema = new Schema(_json)
  return schema
}
function schemaJSON (nodes, content) {
  return {
    nodes: {
      text: { inline: true },
      note: {
        attrs: {
          id: {
            default: null
          },
          placeholder: {
            default: 'This is a Note'
          },
          paint: {
            default: false
          }
        },
        content: 'paragraph+',
        toDOM (node) {
          return ['note', node.attrs, 0]
        },
        parseDOM: [{ tag: 'note' }]
      },
      doc: { content },
      paragraph: {
        attrs: {
          id: {
            default: null
          }
        },
        content: 'text*',
        toDOM (node) {
          return ['p', node.attrs, 0]
        },
        parseDOM: [{ tag: 'p' }]
      },
      heading: {
        attrs: {
          id: {
            default: null
          },
          placeholder: {
            default: 'This is a Heading'

          },
          paint: {
            default: true
          },
          style: {
            default: null
          }
        },
        content: 'text*',
        toDOM (node) {
          return ['h1', node.attrs, ['span', 0]]
        },
        parseDOM: [{ tag: 'h1' }]
      },
      title: {
        content: 'text*',
        attrs: {
          id: {
            default: 'title'
          }
        },
        toDOM (node) {
          return ['div', node.attrs, 0]
        },
        parseDOM: [{ tag: 'div' }]
      },
      ...nodes
    }
  }
}
function swapIndex (from, _to, array) {
  const end = array[_to] === undefined ? array.length - 1 : _to;
  [array[from], array[end]] = [array[end], array[from]]
  return array
}
function updateByIndex (id, data, content, page) {
  const node = data[id].node
  const index = data[id].index
  let contentID = content[index] === undefined ? false : content[index].id
  const matchingIndex = contentID === false ? false : data[contentID].index

  if (data[id].newNode === false) {
    do { swapIndex(index, matchingIndex, content); contentID = content[index].id } while (contentID !== id)
    if (content[index].component === 'reference') { updateTemplate(data[id], content[index]) } else { content[index].data = node }
  } else {
    // create new Node
    const _isTemplate = isTemplate(node)
    const component = _isTemplate ? { component: 'reference' } : { component: node.type.name }

    // generate Template
    if (_isTemplate) {
      const objectID = new mongoose.Types.ObjectId().toString()
      templateStuff(node, page, component, objectID, index)
      return objectID
    }

    // generate Component
    else {
      addIndex(content, index, component)
    }

  }
  return content[index].id
}
// Getters
function dataUpdate (page, tr, data, deletions) {
  const content = dataRemove(page, deletions)

  for (const id of Object.keys(data)) {
    if (page[id] !== undefined) {
      page[id] = data[id].node.textContent
    } else {
      const getID = updateByIndex(id, data, content, page)
      tr.setNodeMarkup(data[id].pos, null, { id: getID })
    }
  }

  page.markModified('content')
  page.save()
  return tr
}
async function getCurrentPage (state) {
  const docID = updateKey.get(state).spec.docID
  const page = await getObject(Page, docID)
  return page
}
function getEditorState (schema, plugins, json) {
  return EditorState.fromJSON({ schema, plugins }, json)
}
async function getItems (collection) {
  const promise = await collection.find({}).exec()
  return promise
}
async function getJSON (ID) {
  const pageData = await getPage(ID)
  const content = pageData[0].content
  const types = await getTypes(content)
  const _json = constructDOM(types)
  return _json
}
function getNodeSpec () {
  return nodeSpec
}
async function getObject (collection, id) {
  const promise = await collection.findOne({ _id: id }).exec()
  return promise
}
async function getPage (ID) {
  const promise = await Page.find({ _id: ID }).exec()
  return promise
}

async function updateTemplate(content, pointer){
  const _id = pointer.reference
  const instance = await Types.findOne({ _id }).exec()
  instance.data = content.node
  instance.markModified('components')
  instance.save()
  console.log(content)
}

async function getTemplateID (type) {
  const promise = await nodeSpec.findOne({ name: type }, { _id: 1 }).exec()
  return promise.id
}
async function getTypes (content) {
  const _temp = []

  for (const _id of content) {
    const result = await Types.findOne({ _id }).exec()
    _temp.push(result)
  }
  return _temp
}

// Update Functions
const pageEvents = {
  async title (node, state) {
    const page = await getCurrentPage(state)
    const text = node.textContent
    page.title = text
    page.save()
  }
}
function getRemovalList (from, to, oldDoc) {
  const _toRemove = []
  oldDoc.forEach((node, offset, index) => {
    const start = offset + 2
    const condition = node.childCount + 1
    const end = offset + node.nodeSize - condition
    if (start >= from && end <= to) _toRemove.push(index - 1)
  })
  return _toRemove
}
async function removeNode (node, state, index) {
  const page = await getCurrentPage(state)
  const _isTemplate = isTemplate(node)

  if (!_isTemplate) page.content = removeIndex(page.content, index)
  else await Types.destroy(page.content[index])
}
async function removeContent (selection, state, isTemplate) {
  const page = await getCurrentPage(state)
  let content = page.content
  const from = selection.from
  const to = selection.to
  const oldDoc = state.doc
  const removalList = getRemovalList(from, to, oldDoc)

  for (const index of removalList) {
    if (!isTemplate) content = removeIndex(content, index)
    else await Types.destroy(content[index])
  }
  page.markModified('content')
  await createItem(page)
}
async function updateNode (node, state, pageIndex) {
  const page = await getCurrentPage(state)
  const _isTemplate = isTemplate(node)
  const isPageItem = node.type.name === 'title'

  if (isPageItem) {
    const type = node.type.name
    page[type] = node.textContent
    return await page.save()
  } else if (!_isTemplate) {
    page.content[pageIndex].data = node
    page.markModified('content')
    return await page.save()
  } else {
    const typeID = getAtIndex(page.content, pageIndex)
    const type = await getObject(Types, typeID)
    for (const component of type.component) component.data = node
    type.markModified('component')
    await createItem(type)
  }
}
async function updateContent (node, _pageIndex, nodeIndex, state, isTemplate) {
  const page = await getCurrentPage(state)
  const pageIndex = isTemplate ? _pageIndex - 1 : _pageIndex
  const isPageItem = node.type.name === 'title'

  if (isPageItem) {
    const type = node.type.name
    page[type] = node.textContent
    await page.save()
    return true
  }

  if (!isTemplate) {
    page.content[pageIndex].data = node
    page.markModified('content')
    await page.save()
    return true
  }
  const typeID = getAtIndex(page.content, pageIndex)
  const type = await getObject(Types, typeID)
  const component = getAtIndex(type.components, nodeIndex)
  component.data = node
  type.markModified('component')
  await createItem(type)
}
async function newPage (editor, plugins, objectID = null) {
  // Variables
  const defaultJSON = { doc: { type: 'doc', content: [{ type: 'title', content: [] }] }, selection: { anchor: 0, head: 0, type: 'text' } }
  const docID = objectID == null ? await createPage() : objectID
  const schema = await getSchema()
  const pageData = objectID == null ? defaultJSON : await getJSON(objectID)
  let PageModel = await getPage(docID)
  PageModel = PageModel[0]

  const updatePlugin = new Plugin({
    docID,
    key: updateKey,

    appendTransaction (_tr, old, newState) {
      const changed = _tr[0].docChanged
      const pageItemCount = 1

      if (changed) {
        // Variables
        const Steps = _tr[0].steps[0]
        const Content = {}
        const Deletions = []
        let tempID = 0
        const newTr = newState.tr
        Steps.getMap().forEach(function (start, end, nstart, nend) {
          // Populate Content Array

          newState.doc.nodesBetween(nstart, nend, function (node, pos, parent, index) {
            const newNode = node.attrs.id === null
            const id = newNode ? tempID++ : node.attrs.id
            const loc = index - pageItemCount
            Content[id] = { node, index: loc, newNode, pos }; return false
          })

          // Updates
          old.doc.nodesBetween(start, end, function (node, pos, parent, index) {
            if (Content[node.attrs.id] == null) Deletions.push(index - pageItemCount)
            return false
          })
        })
        dataUpdate(PageModel, newTr, Content, Deletions)
        console.log(newTr)
        return newTr
      }
    }

  })
  const Plugins = [updatePlugin, ...plugins(schema)]
  const State = getEditorState(schema, Plugins, pageData)
  return newEditor(editor, State)
}
function dataRemove (page, deletions) {
  let removalCount = 0
  deletions.forEach(index => {
    const loc = index - removalCount
    if (page.content[loc].component === 'reference') Types.destroy(page.content[loc].reference)
    removeIndex(page.content, loc)
    removalCount++
  })
  return page.content
}

function isTemplate (node) {
  const type = node.type.name
  return validation(templates, type)
}
function validation (obj, key) {
  const result = Object.prototype.hasOwnProperty.call(obj, key.toString())
  return result
}

async function newNode (node, state, index) {
  const page = await getCurrentPage(state)

  if (!isTemplate) {
    const _component = { component: node.type.name }
    addIndex(page.content, index, _component)
    page.markModified('content')
    return await page.save()
  }

  const templateItem = await createTemplate(node.type.name)
  const reference = { component: 'reference', reference: templateItem.id }

  await addIndex(page.content, index, reference)
  await page.markModified('content')
  await createItem(page)
}

async function createTemplate (type, docID) {
  const templateID = await getTemplateID(type)
  const _templateObject = await getObject(nodeSpec, templateID)
  const typeObject = new Types({
    doc: docID,
    type,
    components: parseContent(_templateObject.content),
    references: []
  })
  const item = await createItem(typeObject)
  return item
}
async function newContent (state, type, index, isTemplate) {
  // Get Data First don't construct an object that isn't real
  const docID = updateKey.get(state).spec.docID
  const page = await getObject(Page, docID)
  if (!isTemplate) {
    const _component = { component: type }
    addIndex(page.content, index, _component)
    page.markModified('content')
    return await page.save()
  }

  const templateItem = await createTemplate(node.type.name)
  const reference = { component: 'reference', reference: itemID }

  // update Doc Content

  await addIndex(page.content, index, reference)
  await page.markModified('content')
  await createItem(page)
  return item
}

function getField (element, path) {
  let result = element
  const _list = path.split('.')
  _list.forEach(field => {
    result = result[field]
  })
  return result
}

// Index and Sort
function mirrorSort (ref, target, path) {
  const array = []
  target.forEach(elem => {
    const field = getField(elem, path)
    const index = ref.indexOf(field)
    array[index] = elem
  })
  return array
}
function getAtIndex (array, index) {
  if (!Array.isArray(array)) throw new TypeError('Object is not an Array')
  if (index > array.length - 1) throw new RangeError('Index is out of Range')
  return array[index]
}
function removeIndex (array, index) {
  if (index > -1 && index < array.length) {
    array.splice(index, 1)
  }
  return array
}
function removeItem (array, item) {
  const loc = array.indexOf(item)
  if (loc > -1) {
    array.splice(loc, 1)
  }
  return array
}

async function templateStuff (node, page, component, objID, index) {
  // Create Template and set ID
  const template = await createTemplate(node.type.name, page.id)
  component.reference = template.id
  component._id = objID

  // Add Index
  addIndex(page.content, index, component)

  // Save Changes
  page.markModified('content')
  page.save()
}
function addIndex (array, index, value) {
  // Add End
  if (index >= array.length - 1) array.push(value)

  // Add Beginning
  else if (index === 0) array.unshift(value)

  // Add Between
  else array.splice(index, 0, value)

  return array
}

// Create Methods
function constructDOM (content) {
  const _content = []
  content.forEach(obj => {
    const type = obj.type
    const data = { type, content: [] }
    const components = obj.components

    components.forEach(field => {
      data.content.push(field.data)
    })

    console.log('ok')
    _content.push(data)
  })
  return { doc: { type: 'doc', content: _content }, selection: { anchor: 0, head: 0, type: 'text' } }
}
function newEditor (editor, state) {
  return new EditorView(editor, { state })
}
async function createItem (item, callback = null) {
  const promise = callback ? await item.save(function (err, item) { callback(err, item) }) : await item.save()
  return promise
}
function createType (name, content) {
  const type = new nodeSpec({
    name,
    content,
    functionValue: [name, 0]
  })
  return type
}
async function populateField (item, field, ...args) {
  const promise = await item.populate(field, ...args).exec()
  return promise
}
async function createPage () {
  const data = new Page({ title: '', content: [], references: [] })
  const Result = await createItem(data)
  return Result.id
}

// Format Methods
function formatNode (data) {
  const json = {}
  data.forEach(item => {
    json[item.name] = {}
    json[item.name].content = item.content
    json[item.name].toDOM = function (node) {
      return item.functionValue
    }
    json[item.name].parseDOM = [{ tag: item.name }]
    json[item.name].attrs = item.attrs
  })
  return json
}
function docContent (json) {
  const keys = Object.keys(json)
  let values = keys.length > 0 ? 'title (paragraph | ' : 'title (paragraph)*'

  for (let i = 0; i < keys.length; i++) {
    if (keys.length === 1) values += keys[i] + ' )*'
    else if (i === 0) values += keys[i] + ' | '
    else if (i === keys.length - 1) values += keys[i] + ' )*'
    else values += keys[i] + ' | '
  }

  return values
}
function parseContent (content) {
  const data = content.split(' ')
  const result = []
  data.forEach(item => {
    const json = { component: item }
    result.push(json)
  })
  return result
}

// Test Methods
async function generateType () {
  const Type = await createType('newblock2', 'heading note')
  createItem(Type)
  console.log('Generated Type')
}

// eslin-disable-next-line no-unused-vars
module.exports = {
  newPage,
  createType,
  createItem,
  produceSchema
}
