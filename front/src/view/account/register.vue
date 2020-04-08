<template>
  <div id="register_form">
    <account-compontent :isEdit="isEdit" :access="access" />
  </div>
</template>

<script>
// import { getUserInfo } from '@/api/user'
import { mapGetters } from 'vuex'
import accountCompontent from './component/account'
export default {
  name: 'register',
  components: {
    accountCompontent
  },
  data () {
    return {
      isEdit: false
    }
  },
  computed: {
    access () {
      return this.getAccess()
    }
  },
  mounted () {
    console.log(1, this.access)
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
