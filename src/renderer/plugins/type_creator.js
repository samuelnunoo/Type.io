import Vue from 'vue'
const model = require('../../../Editor/data/model')
const components = {
  heading: { type: 'heading', content: [], attrs: {} }
}
const operations = {
  heading (data) {
    const placeholder = data.placeholder
    const style = createStyle(data)
    return { placeholder, style }
  }
}

async function createNodeSpec (name, gridElements) {
  let content = ''
  for (const item of gridElements) {
    content += item.name + ' '
  }

  const type = await model.createType(name, content)
  const created = await model.createItem(type)
  return created
}
function createStyle (attrs) {
  let style = ''
  for (const elem of Object.keys(attrs)) {
    style += `--${elem}:${attrs[elem]}; `
  }
  return style
}
function createNode (item, data) {
  const id = item.id
  const type = item.name
  const attributes = getAttributes(type, data[id])
  const templateClone = JSON.parse(JSON.stringify(components[type]))
  templateClone.attrs = attributes

  return templateClone
}
function getAttributes (type, data) {
  return operations[type](data)
}

Vue.prototype.$Template = async function (name, gridElements) {
  // Create Node Spec
  const nodeSpec = await createNodeSpec(name, gridElements)
  const typeData = this.$store.state.typeController.data
  const container = []

  gridElements.forEach(item => {
    const node = createNode(item, typeData)
    container.push(node)
  })
  nodeSpec.template = { type: name, content: container }
  nodeSpec.save()
}
