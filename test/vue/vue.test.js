const { shallowMount } = require('@vue/test-utils')
const Vue = require('vue')
const Test = require('./components/test.vue').default

describe('Counter.vue', () => {
  it('SFC  exists', () => {
    Test.should.exist
  })
  it.only('can load SFC', () => {
    const wrapper = shallowMount(Test)
    console.log(wrapper)
    wrapper.should.exist
  })
  it('increments count when button is clicked', async () => {
    const wrapper = shallowMount(Test)
    // wrapper.find('button').trigger('click')
    // await Vue.nextTick()
    wrapper.find('div').text().should.equal('1')
  })
})
