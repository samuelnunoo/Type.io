<template>
  <div>
    <el-header class="header">
      <el-button class="toggle"  icon="fas fa-bars" @click="toggle" />
    </el-header>

    <el-container>
      <el-aside v-show="active" class="menu">
        <el-menu :router=true >
          <el-menu-item index="/">Home </el-menu-item>
          <el-menu-item index="editor"> Editor</el-menu-item>
          <el-menu-item index="type"> Type Creator</el-menu-item>

        </el-menu>
      </el-aside>
      <nuxt />
    </el-container>
  </div>
  </el-container>
</template>
<script>
export default {

  data () {
    return {
      active: false

    }
  },
  methods: {
    toggle () {
      if (this.active === true) this.active = false; else this.active = true
    }
  }
}
</script>

<style>

  .menu{
   display: none;
    width:0px;
    outline: black solid 1px;
  }
  .collapse{
    height: inherit;

  }
  .toggle{
    height: 100%;
    background:black !important;
    border:0px !important;
    border-radius:0px !important;
    color:white !important;

  }
  .toggle:hover{
    background: #363333 !important;
  }
  .header{
    padding:0px !important;
    background-color:#FFFFFF;
    box-shadow:5px 5px 5px  grey;
    height: 40px !important;
  }

  p,h1,h2,h3{
    font-family: Roboto sans-serif;
  }
  body{
    margin: 0px;
  }

</style>
