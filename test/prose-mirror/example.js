const chai = require('chai')
const $ = require('jquery')
const { tempEditor, Plugin, keyEvent, input, p } = require('./test_env')
chai.should()

describe('Setup Tests', () => {
  it('DOM Environment works', () => {
    const a = tempEditor()
    a.should.equal(a)
  })

  it('Can Load a Plugin', () => {
    const test = new Plugin({
      props: {
        handleDOMEvents: {
          keydown (view, event) {
            console.log(view, event)
          }
        }

      }

    })

    const a = tempEditor({ plugins: [test] })
    a.state.plugins[0].should.equal(test)
  })

  it('Can Focus Editor', () => {
    tempEditor()
    const editor = document.querySelector('.ProseMirror')
    editor.focus()

    document.activeElement.should.equal(editor)
  })

  it('Can Trigger DOM Event', () => {
    let executed = false
    tempEditor()
    const editor = document.querySelector('.ProseMirror')

    const event = new KeyboardEvent('keypress', { keyCode: 40, bubbles: false }) // General
    editor.addEventListener('keypress', () => executed = true)

    event.target = editor

    editor.focus()
    editor.dispatchEvent(event)

    executed.should.equal(true)
    event.target.should.equal(editor)
    event.bubbles.should.equal(false)
    event.keyCode.should.equal(40)
  })

  it('Editor can Handle Simulated Event', () => {
    let value = false

    tempEditor({ handleKeyDown: (_view, event) => value = true })
    const editor = document.querySelector('.ProseMirror')

    const event = new KeyboardEvent('keydown', { keyCode: 40, bubbles: false })
    editor.dispatchEvent(event)
    value.should.equal(true)
  })

  it('Text can be inserted by Event', () => {
    const view = tempEditor({ handleKeyDown: (_view, event) => console.log(event) })
    const editor = document.querySelector('.ProseMirror')
    editor.focus()

    const event = new KeyboardEvent('keydown', { view: window, composed: true, key: 'B', code: 'KeyB', keyCode: 66, bubbles: true })
    editor.dispatchEvent(event)
    view.state.doc.firstChild.textContent.should.equal('B')
  })
})

describe('Type Creator', () => {
  it.only('InputRule is Valid', () => {
    let executed = false
    const rule = new input.InputRule(/\/card/,function(state,match,start,end){
        const [matchedText, content] = match
        const {tr} = state;
        executed = true
        return tr 
    })

    const inputRule = input.inputRules({
        rules: [rule]
    })
    const view = tempEditor({ doc:p('/carz'), plugins: [inputRule] })

    const {tr} = view.state
    tr.insertText('d')
    view.dispatch(tr)
    executed.should.equal(true)
  })


})
