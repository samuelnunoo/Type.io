const mongoose = require('mongoose')
const Schema = mongoose.Schema
const componentSchema = new Schema({}, { discriminatorKey: 'component'})

const Page = new Schema({
  title: String,
  content: [componentSchema],
  references: [{ type: Schema.Types.ObjectID, ref: 'Types' }]
})

const content = Page.path('content')
function validation (obj, key) {
  const result = Object.prototype.hasOwnProperty.call(obj, key.toString())
  return result
}

const paragraph = new Schema({ text: { type: String } })
paragraph.virtual('data')
  .get(function () {
    const value = validation(this._doc, 'text') ? this.text : ''
    return value === '' ? { attrs: { id: this.id }, type: 'paragraph' } : { attrs: { id: this.id }, type: 'paragraph', content: { type: 'text', text: value } }
  })
  .set(function (data) {
    const text = data.textContent
    this.set({ text })
  })

const heading = new Schema({
  heading: {
    type: String
  }
}  )
heading.virtual('data')
  .get(function () {
    const value = validation(this._doc, 'heading') ? this.heading : ''

    return value === '' ? { attrs: { id: this.id }, type: 'heading' } : { attrs: { id: this.id }, type: 'heading', content: [{ type: 'text', text: value }] }
  })
  .set(function (data) {
    const heading = validation(data, 'content') ? data.content[0].text : ''
    this.set({ heading })
  })

const reference = new Schema(
  { reference: { type: Schema.Types.ObjectID, ref: 'Types' } })
reference.virtual('data')
  .get(function () {
    // Get Obj
    // Get Components
    // Get Data forEach
    // Return that as JSON

  })
  .set(function (reference) {
    this.set({ reference })
  })

content.discriminator('heading', heading)
content.discriminator('paragraph', paragraph)
content.discriminator('reference', reference)

module.exports = mongoose.model('Pages', Page)
