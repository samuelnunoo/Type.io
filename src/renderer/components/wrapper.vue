<template>
  <button class="wrapper" @click="selection"> <slot /> </button>
</template>

<script>

export default {
  name: 'Wrapper',
  methods: {
    selection (event) {
      // updateSelection
      const key = event.currentTarget.id
      const type = event.currentTarget.name
      this.$store.commit('typeController/updateSelection', { key, type })
    }
  }
}
</script>

<style scoped>
  .wrapper{
    width:100%;
    border:none;
    background-color:#F8F8F8;
  }
  .wrapper:hover{
    background-color: #ECF3F8;
  }

</style>
