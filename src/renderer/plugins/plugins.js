// Imports

const insertPoint = require('prosemirror-transform').insertPoint
const { exampleSetup } = require('prosemirror-example-setup')
const state = require('prosemirror-state')
const Plugin = state.Plugin
const { Decoration, DecorationSet } = require('prosemirror-view')
const { keymap } = require('prosemirror-keymap')
const nodeSpec = require('../../../Editor/data/Schema/nodeSpec')
const TextSelection = state.TextSelection

// Functions
async function getNode (state) {
  const block = await nodeSpec.findOne({ name: 'Example123' }).exec()
  const schema = state.schema
  const node = schema.nodeFromJSON(block.template)
  return node
}
function nextNode (state, dispatch) {
  const doc = state.doc
  const endPos = state.selection.$anchor.end()
  const tr = state.tr
  let rePos
  let isDoc = null

  // nextPos
  try {
    rePos = doc.resolve(endPos + 2)
    isDoc = (rePos.node() === state.doc || rePos.node().type.name === 'notegroup')
  } catch {
  }

  // Check if Next
  if (isDoc === false) {
    const _selection = new TextSelection(rePos)
    const transaction = tr.setSelection(_selection)
    if (dispatch) { dispatch(transaction.scrollIntoView()) }
    return true
  } else if (dispatch) {
    const block = state.schema.nodes.paragraph
    const loc = endPos + 1

    tr.insert(loc, block.createAndFill())
    tr.setSelection(TextSelection.create(tr.doc, loc).map(tr.doc, tr.mapping))
    dispatch(tr)
    return true
  }
}
async function newNote (state, dispatch) {
  const tr = state.tr
  const doc = state.doc
  const endPos = tr.selection.$anchor.end()
  const node = doc.childBefore(endPos)

  const start = node.offset
  const end = start + node.node.nodeSize
  const block = await getNode(state)
  const insert = insertPoint(state.doc, end, block.type)
  if (insert !== null) {
    tr.insert(insert, block)
    dispatch(tr)
  }
}

// Plugins
const placeholder = new Plugin({
  props: {

    decorations: ({ doc }) => {
      // Decoration List
      const decorations = []

      // Iterate all Top-layer Descendants of Documents
      doc.descendants((node, pos) => {
        const type = node.type.name

        if (type === 'title') {
          const isNodeEmpty = node.textContent === ''
          if (isNodeEmpty) {
            const decor = Decoration.node(pos, node.nodeSize, {
              class: 'isEmpty'
            })
            decorations.push(decor)
          }
        }
        node.forEach((child, offset) => {
          const classes = []
          const childPos = pos + offset + 1
          const isNodeEmpty = child.textContent === ''

          // Paint Check -> Add Note Type Class
          if (child.attrs.paint) {
            classes.push(node.attrs.type)
          }

          // Empty Check
          if (isNodeEmpty) {
            classes.push('is-empty')
          }

          // Add classes to Decoration Object
          const decoration = Decoration.node(childPos, childPos + child.nodeSize, {
            class: 'isEmpty'

          })

          // Add Decoration to Decoration List
          decorations.push(decoration)
        })
        return false
      })

      // Return DecorationSet
      return DecorationSet.create(doc, decorations)
    }
  }

})
function Plugins (schema) {
  return [
    ...exampleSetup({ schema }),
    keymap({
      'Shift-q': newNote
    }),
    placeholder

  ]
}

// Exports
module.exports = Plugins
