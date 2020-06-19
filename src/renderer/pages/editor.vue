<template>
  <div class="container">
    <div ref="editor" class="container" />
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

<style>
  :root{
    --color:black;
    --highlight: none;
    --size: 100%;
  }
  #title{
    padding: 100px 0px 100px 0px;
    font-size: 300%;
    outline:none;

  }
  #title.isEmpty:after{
    content: "Hello World";
    color:grey;
    font-family: Roboto sans-serif;
  }
  .ProseMirror-menubar{
    display:none;
  }
  .container{
    margin:auto;
    width:860px;
  }
  span{
    font-size: var(--size);
    color: var(--color, black);
    background: var(--highlight);
    padding: 10px;
  }
  span::before{
    content: attr(placeholder);

  }
</style>
