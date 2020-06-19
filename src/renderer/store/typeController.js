import Vue from 'vue'

const configs = {
  heading: {
    color: '',
    highlight: '',
    placeholder: 'Default Heading',
    size: ''
  }
}

export const state = () => ({
  selection: null,
  type: null,
  data: {}
})
export const mutations = {
  createData (state, payload) {
    const hasProp = Object.prototype.hasOwnProperty.call(state.data, payload.id)
    if (!hasProp) Vue.set(state.data, payload.id, JSON.parse(JSON.stringify(configs[payload.name])))
  },
  updateSelection (state, payload) {
    state.selection = payload.key
    state.type = payload.type
  },
  updateParam (state, payload) {
    const selection = state.data[state.selection]
    Vue.set(selection, payload.param, payload.value)
  }
}
export const getters = {
  currentConfig: state => {
    return state.data[state.selection]
  }
}
