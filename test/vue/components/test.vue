<template>
  <el-container>
    <el-header class="cover">
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
