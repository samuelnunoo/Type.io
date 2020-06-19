<template>
  <div>
    <div> <h1> HEADING </h1></div>
    <el-collapse>
      <el-collapse-item title="PLACEHOLDER">
        <el-input id="placeholder" v-model="placeholder" placeholder="Placeholder Text" />
      </el-collapse-item>
      <el-collapse-item title="HIGHLIGHT COLOR">
        <el-color-picker id="highlight" v-model="highlight" color-format="rgb" @active-change="sethighlight" />
      </el-collapse-item>
      <el-collapse-item title="TEXT COLOR">
        <el-color-picker id="color" v-model="color" color-format="rgb" @active-change="setcolor" />
      </el-collapse-item>
      <el-collapse-item title="TEXT SIZE">
        <el-select v-model="size" placeholder="Select Size">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>

export default {
  name: 'HeadingConfig',
  data () {
    return {
      type: 'heading',
      options: [{ label: 'H1', value: '400%' }, { value: '300%', label: 'H2' }, { value: '200%', label: 'H3' }]
    }
  },
  computed: {
    config () {
      return this.$store.getters['typeController/currentConfig']
    },
    placeholder: {
      get () {
        return this.config.placeholder
      },
      set (value) {
        this.$store.commit('typeController/updateParam', { type: this.type, param: 'placeholder', value })
      }
    },
    highlight: {
      get () {
        return this.config.highlight
      },
      set (value) {
        this.$store.commit('typeController/updateParam', { type: this.type, param: 'highlight', value })
      }
    },
    color: {
      get () {
        return this.config.color
      },
      set (value) {
        this.$store.commit('typeController/updateParam', { type: this.type, param: 'color', value })
      }

    },
    size: {
      get () {
        return this.config.size
      },
      set (value) {
        this.$store.commit('typeController/updateParam', { type: this.type, param: 'size', value })
      }
    }
  },
  methods: {
    sethighlight (event) {
      this.highlight = event
    },
    setcolor (event) {
      this.color = event
    }
  }
}
</script>

<style scoped>

</style>
