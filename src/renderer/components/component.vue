<template>
  <div class="component">
    <i :class="classes" />
    <p> {{ name }}</p>
  </div>
</template>

<script>
export default {
  name: 'Component',
  props: {
    name: String,
    image: String
  },
  computed: {
    classes () {
      const img = this.image ? this.image : ''
      return 'icon ' + img
    }
  }
}
</script>

<style scoped>

  .icon{
    font-size: 40px;
    padding-top: 30px;

  }
  .component{
    display:flex;
    flex-direction:column;
    width:100%;
    height: 130px;
    text-align:center;
    color:white;

    background-color: #464646;
  }

  .component:hover{
    background-color: #595858;
  }
</style>
