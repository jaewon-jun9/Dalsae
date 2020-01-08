<template>
  <div class="user-call">
  </div>
</template>

<script>
import {EventBus} from '../../main.js';
import Streaming from './Streaming.js';
import OAuth from '../../OAuth.js'
import axios from 'axios'

export default {
  name: "streaming",
  props: {
  },
  created() {
		console.log('streaming created')
		Streaming.ConnectStreaming(this.selectAccount.oauth_token, this.selectAccount.oauth_token_secret);
  },
  data() {
    return {
    };
  },
  computed:{
    selectAccount(){
      return this.$store.state.Account.selectAccount;
    }
  },
  methods: {
   
  },
  mounted: function() {//EventBus등록용 함수들
    
	},
};
</script>

<style lang="scss">

</style>
