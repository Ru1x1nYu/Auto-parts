<template>
  <div id="register_form">
    <account-compontent :isEdit="isEdit" :access="access" :isOtherEdit="isOtherEdit"></account-compontent>
  </div>
</template>

<script>
// import { getUserInfo } from '@/api/user'
import { mapGetters } from 'vuex'
import accountCompontent from './component/account'
export default {
  name: 'editAccount',
  components: {
    accountCompontent
  },
  data () {
    return {
      isEdit: true
    }
  },
  computed: {
    access () {
      return this.getAccess()
    },
    isOtherEdit () {
      return Boolean(this.$route.params.id && this.$route.params.id !== '')
    }
  },
  mounted () {
    console.log(this.isOtherEdit)
    // getUserInfo()
  },
  methods: {
    ...mapGetters([
      'getAccess'
    ])
  }
}
</script>

<style lang="less">

</style>
