//Imports
let db = require("./database");
let Schema = require("prosemirror-model").Schema;
let EditorView = require("prosemirror-view").EditorView;
let EditorState = require("prosemirror-state").EditorState;

//Models
let nodeSpec = require('./Schema/nodeSpec');
let Page = require("./Schema/Page");

async function newPage(editor){
  let result;
  let id;
  let node;
  let content;
  let sequence = [
    getPage,
    createItem,
    setID,
    getNodeSpec,
    getItems,
    formatNode,
    setNode,
    docContent,
    setContent,]

  function setID(data){
    id = data._doc._id
  }
  function setContent(result){
    content = result;

  }
  function setNode(json){
    node = json
    return json
  }

  for (const f of sequence){
    result = await f(result)
  }

  let Schema = getSchema(node,content)
  let Plugins = []
  let State = getEditorState(Schema,Plugins,{ doc:{type:"doc", content:[]},selection:{anchor:0,head:0,type:"text"}})

  return newEditor(editor,State)




}
function getEditorState(schema,plugins,json){
  return EditorState.fromJSON({schema, plugins},json)
}
function newEditor(editor,state){
  return new EditorView(editor, {state})
}
async function getPage(){
  return new Page({title:'',content:[],references:[]})
}
function getNodeSpec(){
  return nodeSpec
}
async function createItem(item){
  var promise = await item.save()
  return promise
}
async function getItems(collection){
  var promise = await collection.find({}).exec()
  return promise

}
function formatNode(data){
  const json = {}
  data.forEach(item => {
    json[item.name] = item.content
    json[item.name].toDOM = function () {
      return item.functionValue
    }
  })
  return json
}
function docContent(json) {
  var values = "heading "
  const keys = Object.keys(json)

  for (var i = 0; i < keys.length; i++) {
    if (i == 0) values += "( " + keys[i] + " | "
    else if (i == keys.length - 1) values += keys[i] + " )+"
    else values += keys[i] + " | "
  }

  return values
}
function getSchema(nodes,content){
  return new Schema({
    nodes: {
      text: {},
      doc: {content: content},
      note: {
        attrs: {
          placeholder: {
            default: "This is a Note"
          },
          paint: {
            default: false
          }
        },
        content: "paragraph+",
        toDOM(node) {
          return ["note", node.attrs, 0]
        },
        parseDOM: [{tag: "note"}]
      },
      paragraph: {
        content: "text*",
        toDOM(node) {
          return ["p", 0]
        },
        parseDOM: [{tag: "p"}]
      },
      heading: {
        attrs: {
          placeholder: {
            default: "This is a Heading"

          },
          paint: {
            default: true
          }
        },
        content: "text*",
        toDOM(node) {
          return ["h1", node.attrs, ["span", 0]]
        },
        parseDOM: [{tag: "h1"}]
      },
      ...nodes,

    },


  })

}
function createType(name,content,functionValue){
  let type = new nodeSpec({
    name,
    content,
    functionValue
  })
  return type

}


module.exports = {
  newPage,
  createType,
}
