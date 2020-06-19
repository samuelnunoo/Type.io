// Imports
const mongoose = require('mongoose')
const Schema = mongoose.Schema


// Component and Validation
const componentSchema = new Schema({}, { discriminatorKey: 'component', _id: false })
function validation (obj, key) {
  const result = Object.prototype.hasOwnProperty.call(obj, key.toString())
  return result
}


// Main Schema
const NodeInstance = new Schema({
  doc: { type: Schema.Types.ObjectID, ref: 'Pages' },
  type: String,
  components: [componentSchema],
  references: [{ type: Schema.Types.ObjectID, ref: 'Pages' }]
})

// Data Setter
NodeInstance.virtual('data')
  .set(function (data) {
    const content = data.content.content
    const components = this.components
    for (let i = 0; i < content.length; i++) {
      components[i].data = content[i]
    }
  })
// Testing
NodeInstance.statics.destroy = async function (_id) {
  const Type = await mongoose.model('Types').findOne({ _id }).exec()
  const _list = Type.references
  const Pages = await mongoose.model('Pages').find({ _id: { $in: _list } }).exec()

  for (const page of Pages) {
    const content = page.content

    for (let i = 0; i < content.length; i++) {
      if (content[i].component === 'reference') {
        if (content[i].reference.toString() === _id.toString()) {
          content.splice(i, 1)
          page.markModified('content')
          page.save()
        }
      }
    }
  }

  mongoose.model('Types').deleteOne({ _id }).exec()
}

// Array Path
const docArray = NodeInstance.path('components')

// Heading
const heading = new Schema({
  heading: {
    type: String
  }
}, { _id: false })
heading.virtual('data')
  .get(function () {
    const value = validation(this._doc, 'heading') ? this.heading : ''

    return value === '' ? { type: 'heading' } : { type: 'heading', content: [{ type: 'text', text: value }] }
  })
  .set(function (data) {
    const heading = data.content.content.length !== 0 ? data.content.content[0].text : ''
    this.set({ heading })
  })

// RichText
const note = new Schema({
  note: {
    type: String
  }
}, { _id: false })
note.virtual('data')
  .get(function () {
    const value = validation(this._doc, 'note') ? this.note : ''
    const _data = { type: 'note', content: [] }
    const line = value.split('\n')
    line.forEach(p => {
      const paragraph = p === '' ? { type: 'paragraph' } : { type: 'paragraph', content: [{ type: 'text', text: p }] }
      _data.content.push(paragraph)
    })
    return _data
  })
  .set(function (data) {
    let note = ''
    const content = validation(data, 'content') ? data.content : false
    if (content) {
      for (let i = 0; i < content.length; i++) {
        note += validation(content[i], 'content') ? content[i].content[0].text : ''
        if (i < content.length - 1) note += '\n'
      }
      this.set({ note })
    } else this.set({ note: '' })
  })

// Register Components
docArray.discriminator('heading', heading)
docArray.discriminator('note', note)

// Export
module.exports = mongoose.model('NodeInstance', NodeInstance)
