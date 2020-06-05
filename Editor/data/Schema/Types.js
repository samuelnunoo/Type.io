const mongoose = require('mongoose')
const Schema = mongoose.Schema

const componentSchema = new Schema({}, { discriminatorKey: 'component', _id: false })
function validation (obj, key) {
  const result = Object.prototype.hasOwnProperty.call(obj._doc, key.toString())
  return result
}

const Types = new Schema({
  doc: Schema.Types.ObjectID,
  type: String,
  components: [componentSchema],
  references: Schema.Types.Mixed
})

// Array Path
const docArray = Types.path('components')

// Heading
const heading = new Schema({
  heading: {
    type: String
  }
}, { _id: false })
heading.virtual('data')
  .get(function () {
    const value = validation(this, 'heading') ? this.heading : ''

    return { type: 'heading', content: [{ type: 'text', text: value }] }
  })
  .set(function (data) { const heading = data.content[0].text; this.set({ heading }) })

// RichText
const note = new Schema({
  note: {
    type: String
  }
}, { _id: false })
note.virtual('data')
  .get(function () {
    const value = validation(this, 'note') ? this.note : ''
    const _data = { type: 'note', content: [] }
    const line = value.split('\n')
    line.forEach(p => {
      const paragraph = { type: 'paragraph', content: [{ type: 'text', text: p }] }
      _data.content.push(paragraph)
    })
    return _data
  })
  .set(function (data) {
    let note = ''
    const content = data.content

    for (let i = 0; i < content.length; i++) {
      note += content[i].content[0].text
      if (i < content.length - 1) note += '\n'
    }

    this.set({ note })
  })

// Register Components
docArray.discriminator('heading', heading)
docArray.discriminator('note', note)

// Export
module.exports = mongoose.model('Types', Types)
