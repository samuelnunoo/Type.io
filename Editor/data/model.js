// Imports
const db = require('./database')
const Schema = require('prosemirror-model').Schema
const EditorView = require('prosemirror-view').EditorView
const EditorState = require('prosemirror-state').EditorState
const state = require('prosemirror-state')
const Plugin = state.Plugin
const PluginKey = state.PluginKey
const updateKey = new PluginKey('updatePlugin')

// Models
const nodeSpec = require('./Schema/nodeSpec')
const Page = require('./Schema/Page')
const Types = require('./Schema/Types')
// Main Functions
async function newPage (editor, plugins, objectID = null) {
  // Variables
  let result
  let node
  let content
  const defaultJSON = { doc: { type: 'doc', content: [] }, selection: { anchor: 0, head: 0, type: 'text' } }
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
    return json
  }

  // Execution
  for (const f of sequence) {
    result = await f(result)
  }
  const Schema = getSchema(node, content)
  const docID = objectID == null ? await createPage() : objectID
  const pageData = objectID == null ? defaultJSON : await getJSON(objectID)
  const updatePlugin = new Plugin({
    docID,
    key: updateKey,
    appendTransaction (tr, old, newState) {
      const _tr = tr[0]
      const changed = _tr.docChanged

      if (changed) {
        const oldChildCount = old.doc.childCount
        const newChildCount = newState.doc.childCount
        const _pos = _tr.selection.$anchor.pos
        const doc = newState.doc
        const base = doc.childBefore(_pos)
        const typeIndex = base.index
        const nodeIndex = base.node.childBefore(_pos).index
        const node = base.node.childBefore(_pos).node.toJSON()
        const type = base.node.type.name

        if (newChildCount > oldChildCount) {
          newType(newState, type, typeIndex)
        } else if (newChildCount < oldChildCount) {} else { updateType(node, typeIndex, nodeIndex, newState) }
      }
    }

  })
  const Plugins = [updatePlugin, ...plugins]
  const State = getEditorState(Schema, Plugins, pageData)
  return newEditor(editor, State)
}
async function newType (state, type, index) {
  // Get Data First don't construct an object that isn't real
  const docID = updateKey.get(state).spec.docID
  const typeID = await getTypeID(type)
  const _typeObject = await getObject(nodeSpec, typeID)
  const typeObject = new Types({
    doc: docID,
    type,
    components: parseContent(_typeObject.content),
    references: []
  })
  const item = await createItem(typeObject)
  const itemID = item._doc._id

  // update Doc Content
  const page = await getObject(Page, docID)
  await addIndex(page.content, index, itemID)
  await page.markModified('content')
  await createItem(page)
  return item
}
async function updateType (node, typeIndex, nodeIndex, state) {
  const docID = updateKey.get(state).spec.docID
  const page = await getObject(Page, docID)
  const typeID = getAtIndex(page.content, typeIndex)
  const type = await getObject(Types, typeID)
  const component = getAtIndex(type.components, nodeIndex)
  component.data = node
  type.markModified('component')
  await createItem(type)
}

// Helper Functions
function getAtIndex (array, index) {
  if (!Array.isArray(array)) throw new TypeError('Object is not an Array')
  if (index > array.length - 1) throw new RangeError('Index is out of Range')
  return array[index]
}
function removeIndex (array, index) {
  const loc = array.indexOf(index)
  if (index > -1) {
    array.splice(loc, 1)
  }
  return array
}
async function addIndex (array, index, value) {
  // Add End
  if (index >= array.length - 1) array.push(value)

  // Add Beginning
  else if (index === 0) array.unshift(value)

  // Add Between
  else array.splice(index, 0, value)

  return array
}
async function getObject (collection, id) {
  const promise = await collection.findOne({ _id: id }).exec()
  return promise
}
async function getJSON (ID) {
  const pageData = await getPage(ID)
  const content = pageData._doc.content
  const types = await getTypes(content)
  const _json = constructDOM(types)
  return _json
}
async function getTypes (content) {
  const promise = await Types.find({ _id: { $in: content } }).exec()
  return promise
}
function constructDOM (content) {
  const _content = []
  content.forEach(obj => {
    const type = obj.type
    const data = { type, content: [] }
    const components = obj.components

    components.forEach(field => {
      data.content.push(field.parse)
    })
    _content.push(data)
  })
  return { doc: { type: 'doc', content: _content }, selection: { anchor: 0, head: 0, type: 'text' } }
}
async function getPage (ID) {
  const promise = await Page.find({ _id: ID }).exec()
  return promise
}
function getEditorState (schema, plugins, json) {
  return EditorState.fromJSON({ schema, plugins }, json)
}
function newEditor (editor, state) {
  return new EditorView(editor, { state })
}
function getNodeSpec () {
  return nodeSpec
}
async function createItem (item, callback = null) {
  const promise = callback ? await item.save(function (err, item) { callback(err, item) }) : await item.save()
  return promise
}
async function getItems (collection) {
  const promise = await collection.find({}).exec()
  return promise
}
function formatNode (data) {
  const json = {}
  data.forEach(item => {
    json[item.name] = {}
    json[item.name].content = item.content
    json[item.name].toDOM = function (node) {
      return item.functionValue
    }
    json[item.name].parseDOM = [{ tag: item.name }]
  })
  return json
}
function docContent (json) {
  let values = ''
  const keys = Object.keys(json)

  for (let i = 0; i < keys.length; i++) {
    if (keys.length === 1) values += keys[i] + '+'
    else if (i === 0) values += '( ' + keys[i] + ' | '
    else if (i === keys.length - 1) values += keys[i] + ' )+'
    else values += keys[i] + ' | '
  }

  return values
}
function getSchema (nodes, content) {
  return new Schema({
    nodes: {
      text: {},
      note: {
        attrs: {
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
        content: 'text*',
        toDOM () {
          return ['p', 0]
        },
        parseDOM: [{ tag: 'p' }]
      },
      heading: {
        attrs: {
          placeholder: {
            default: 'This is a Heading'

          },
          paint: {
            default: true
          }
        },
        content: 'text*',
        toDOM (node) {
          return ['h1', node.attrs, ['span', 0]]
        },
        parseDOM: [{ tag: 'h1' }]
      },
      ...nodes

    }

  })
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
async function getTypeID (type) {
  const promise = await nodeSpec.findOne({ name: type }, { _id: 1 }).exec()
  return promise._doc._id
}
// eslint-disable-next-line no-unused-vars
async function blockAdded (docID, type) {
  const typeID = await getTypeID(type)
  const newBlock = new Types({
    doc: docID,
    type,
    components: typeID,
    references: []

  })
  const savedItem = await createItem(newBlock)
  const pop = await populateField(savedItem, 'components')
  return pop
}
async function createPage () {
  const data = new Page({ title: '', content: [], references: [] })
  const Result = await createItem(data)
  return Result._doc._id
}
async function generateType () {
  const Type = await createType('newblock2', 'heading note')
  createItem(Type)
  console.log('Generated Type')
}

// eslint-disable-next-line no-unused-vars
module.exports = {
  newPage,
  createType,
  createPage

}
