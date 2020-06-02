<template>
  <div>
    <div ref="editor"></div>
  </div>
</template>

<script>
export default {
  components: {

  },
  data () {
    return {
      editor:null
    }
  },
  mounted(){
    var _editor = this.$refs.editor
    this.editor = this.$NewEditor(_editor)

  }
}
</script>

