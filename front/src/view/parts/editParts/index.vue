<template>
  <parts-component :isEdit="isEdit" />
</template>

<script>
import partsComponent from '../component/parts'
export default {
  name: 'editParts',
  components: {
    partsComponent
  },
  data () {
    return {
      isEdit: true
    }
  }
}
</script>
