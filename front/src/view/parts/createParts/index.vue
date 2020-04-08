<template>
  <parts-component :isEdit="isEdit" />
</template>

<script>
import partsComponent from '../component/parts'
export default {
  name: 'createParts',
  components: {
    partsComponent
  },
  data () {
    return {
      isEdit: false
    }
  }
}
</script>
