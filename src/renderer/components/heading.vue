<template>
  <wrapper>
    <h1><span class="heading" tag="wow" :style="style" :size="obj.size" :color="obj.color" :placeholder="obj.placeholder" /></h1>
  </wrapper>
</template>

<script>
import wrapper from '../components/wrapper'
export default {
  name: 'Heading',
  components: {
    wrapper
  },
  data () {
    return {
      id: null
    }
  },
  computed: {
    obj () {
      return this.$store.state.typeController.data[this.id]
    },
    highlight () {
      const highlight = this.obj.highlight
      return highlight == null ? '' : highlight.toString().replace(')', ', 0.6)')
    },
    style () {
      return `--highlight: ${this.highlight}; --size: ${this.obj.size}; --color: ${this.obj.color}; --placeholder: ${this.obj.placeholder};`
    }
  },
  beforeMount () {
    this.id = this.$attrs.id
    this.$store.commit('typeController/createData', { id: this.id, name: this.$attrs.name })
  }


}
</script>

<style>
:root{
  --color:black;
  --highlight: none;
  --size: 300%;
}
.heading{
  font-size: var(--size);
  color: var(--color, black);
  background: var(--highlight);
  padding: 10px;
}
.heading::before{
    content: attr(placeholder);

  }
</style>
