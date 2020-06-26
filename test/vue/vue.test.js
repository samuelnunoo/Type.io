const  { mount, shallowMount } = require('@vue/test-utils')
const  Counter = require('./counter')


describe('Counter', () => {
  // Now mount the component and you have the wrapper
  const wrapper = mount(Counter)
  console.log(wrapper)

  it.only('Wrapper is Defined', () => {
    wrapper.should.exist
  })

  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })

  // it's also easy to check for the existence of elements
  it('has a button', () => {
    expect(wrapper.contains('button')).toBe(true)
  })
})
