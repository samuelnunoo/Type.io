<template>
  <el-container>
    <el-aside class="column">
      <draggable class="inner-column" :clone="setID" :list="myArray" :group="{name:'components', pull:'clone', put:'false'}" :sort="false">
        <components v-for="element in myArray" :key="element.id" :type="element.name" v-bind="element" />
      </draggable>
    </el-aside>
    <el-main>
      <el-input v-model="name" placeholder="idk"></el-input>
      <el-button @click="createTemplate"></el-button>
      <div id="grid" class="container">
        <draggable id="typeContainer" class="workspace" tag="div" :list="gridElements" group="components" >
          <component :is="component.name" v-for="component in gridElements" :id="component.id" :name="component.name" />
        </draggable>
      </div>
    </el-main>
    <el-aside class="column" >
      <component class='config' :is="current" />
    </el-aside>
  </el-container>
</template>

<script>
import draggable from 'vuedraggable'
import heading from '../components/heading'
import note from '../components/note'
import components from '../components/component'
import headingConfig from '../components/headingConfig'

export default {
  name: 'TypeVue',
  components: {
    draggable,
    heading,
    note,
    components,
    headingConfig
  },
  data () {
    return {
      myArray: [{ id: 1, name: 'heading', image: 'fas fa-heading' }, { id: 2, name: 'note', image: 'fas fa-pencil-alt' }, { id: 3, name: 'note', image: 'fas fa-pencil-alt' }],
      gridElements: [],
      globalID: 0,
      name: 'example1'
    }
  },
  computed: {
    current () {
      const type = this.$store.state.typeController.type
      const current = type === null ? null : type + 'Config'
      return current
    }
  },
  methods: {
    setID ({ name }) {
      return { id: this.globalID++, name }
    },
    createTemplate () {
      this.$Template(this.name, this.gridElements)
    }

  }

}
</script>

<style>
  .config{
    padding:10px;
  }
  .el-collapse div,input{
    background-color: #303030 !important;
    border:none;
    color:white;

  }
  .el-collapse{
    border:none !important;
  }
  .workspace{
    padding:40px;
    width:100%;
  }
  .inner-column{
    display:grid;
    justify-content:center;
    grid-template-columns: repeat(2,130px);
    grid-template-rows: repeat(auto-fill,130px);
    column-gap:5px;
    row-gap:5px;
    padding-top:10px;
  }
  .container{
    display:flex;
  }
  #grid{
    background-color:#F8F8F8;
    width: 860px;
    height: 100%;
    margin: auto;
    outline: #BCBCBC solid 1px;

  }
.column{
  width:360px;
  background-color: #303030;
  height: 1000px;
}
  .component{
    width:10px;
    padding:0px;
    background:#464646;
    border:0px;
  }
  .component:focus{
    background: #5b5d5f !important;
  }
  .row{
    padding: 5px 10px 0px 10px;
    margin-bottom: 2.5px;
  }
</style>
