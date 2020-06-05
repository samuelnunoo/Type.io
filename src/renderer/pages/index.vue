<template>
  <div>
    <div ref="editor" />
  </div>
</template>

<script>
export default {
  components: {

  },
  data () {
    return {
      editor: null
    }
  },
  mounted () {
    const _editor = this.$refs.editor
    this.editor = this.$NewEditor(_editor)
  }
}
</script>
