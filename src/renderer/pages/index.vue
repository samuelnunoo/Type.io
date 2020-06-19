<template>
  <el-container>
    <el-header class="cover">
      <img class="cover" style="width:inherit" src="../assets/cabin.jpg">
    </el-header>
    <el-main />
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {

    }
  },
  methods: {
    handleSelect (key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<style>
  .cover{
        object-fit: cover !important;
    align-self: center;
    width:100%;
    background-color: black;
    height: 270px !important;
    padding:0px;
  }
  .menu{
    display:block;

  }

</style>
