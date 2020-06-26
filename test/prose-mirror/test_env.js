const { EditorView } = require('prosemirror-view')
const { Plugin, EditorState, Selection, TextSelection, NodeSelection } = require('prosemirror-state')
const { schema, doc, p } = require('prosemirror-test-builder')
const input = require('prosemirror-inputrules')

function selFor (doc) {
  const a = doc.tag.a
  if (a != null) {
    const $a = doc.resolve(a)
    if ($a.parent.inlineContent) return new TextSelection($a, doc.tag.b != null ? doc.resolve(doc.tag.b) : undefined)
    else return new NodeSelection($a)
  }
  return Selection.atStart(doc)
}

let tempView = null

function tempEditor (inProps) {
  const space = document.querySelector('#editor')
  if (tempView) {
    tempView.destroy()
    tempView = null
  }

  const props = {}
  for (const n in inProps) props[n] = inProps[n]
  props.state = EditorState.create({
    doc: props.doc,
    schema,
    selection: props.doc && selFor(props.doc),
    plugins: props.plugins
  })
  return tempView = new EditorView(space, props)
}
exports.tempEditor = tempEditor

function findTextNode (node, text) {
  if (node.nodeType === 3) {
    if (node.nodeValue === text) return node
  } else if (node.nodeType === 1) {
    for (let ch = node.firstChild; ch; ch = ch.nextSibling) {
      const found = findTextNode(ch, text)
      if (found) return found
    }
  }
}
exports.findTextNode = findTextNode

function requireFocus (pm) {
  if (!document.hasFocus()) { throw new Error("The document doesn't have focus, which is needed for this test") }
  pm.focus()
  return pm
}
exports.requireFocus = requireFocus

exports.Plugin = Plugin

function Events (elem, name) {
  const event = new Event(name)
  elem.addEventListener(name, function (e) { console.log(e) }, false)
  return event
}

function keyEvent (code) {
  const event = document.createEvent('Event')
  event.initEvent('keydown', true, true)
  event.keyCode = code
  return event
}

exports.keyEvent = keyEvent
exports.input = input
exports.p = p

