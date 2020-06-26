<template>
<div>
  <el-dialog

    :visible.sync="dialogVisible"
    width="95%"
    :before-close="handleClose"
  >
    <div class="flex">
      <div id="name">
        <el-input minlength="3" max-length="20" size="small" placeholder="Card Name" />
      </div>
      <el-button type="success"> Create </el-button>
    </div>
    <div id="container" />
    <div id="stuff">
      <div class="decoration" />
      <el-button class="add" type="primary" icon="el-icon-edit" circle />
    </div>
  </el-dialog>
  </div>
</template>

<script>
export default {
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

<style scoped>

@import url("//unpkg.com/element-ui@2.13.2/lib/theme-chalk/index.css");
.add{
  color:white;
  backgorund:black;
  background-color:black;
  border-color:black;
  position:
}
.decoration{
  background-color:black;
  width:80%;
  height:5px;
  margin: 0 auto;
}
#container{
  width: 80%;
  min-height: 200px;
  height: auto;
  background-color: #E5E5E5;
  margin: 0 auto;
}
.flex{
  display:flex;
  justify-content:space-around;
  width:100%;
  margin: 0 auto;
}


</style>
