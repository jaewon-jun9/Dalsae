<template>
  <div :class="{'qt': true,'hover': isHover||isFocus}" @mousedown="Click">
    <img
      :class="{'profile':!option.isBigPropic,'profile-big':option.isBigPropic}"
      v-bind:src="propic()"
      v-if="option.isShowPropic"
    />
    <div class="tweet-text">
      <div class="tweet-name">
        <span
          class="tweet-name-content"
          :class="{'protected':Protected}"
        >{{TweetName}}</span>
      </div>
      <div class="tweet-content" :class="{'noti':Noti()}">
        <div v-html="TweetText">
        </div>
      </div>
      <div class="retweet-info" v-if="tweet.retweeted_status!=undefined"> 
        <img :src="tweet.user.profile_image_url_https"/>
        <span>{{tweet.user.screen_name+'/'+tweet.user.name}}</span>
      </div>
      <div class="tweet-timestamp">{{TweetDate}}</div>
      <div class="tweet-rts">
        <span v-if="tweet.orgTweet.retweeted">RT!</span>
        <span v-if="tweet.orgTweet.favorited">FAV!</span>
      </div>
    </div>
    <div
      class="tweet-images"
      v-if="tweet.extended_entities!=undefined && option.isShowPreview">
      <img
        class="tweet-image"
        v-for="image in tweet.extended_entities.media"
        :key="image.index"
        :src="image.media_url_https+':thumb'"
      />
    </div>
    </div>
</template>

<script>
import {EventBus} from '../../main.js';
import ContextMenu from '../ContextMenu/ContextMenu.vue'
export default {
  name: "tweet",
  components:{
    ContextMenu,
  },
  props: {
    tweet: undefined,
    option: undefined,
    selected:false,
    index:undefined,
    isDaehwa:false,
  },
  data() {
    return {
      isHover:false,
      isFocus:false,
    };
  },
  computed:{
    TweetDate(){
      var locale=window.navigator.language;
      var moment = require('moment');
      moment.locale(locale);
      var date = new Date(this.tweet.orgTweet.created_at);
      return moment(date).format('LLLL') +':'+ moment(date).format('ss');
    },
    Protected(){
      if(this.tweet.retweeted_status!=undefined){
        return false;//리트윗일 경우 플텍 표시 XXXXX
      }
      else{
        return this.tweet.user.protected
      }
    },
    TweetName(){
      return this.tweet.orgUser.screen_name+' / '+this.tweet.orgUser.name+'/';
    },
    TweetText(){
      var text=this.tweet.orgTweet.full_text;
      var tweet=this.tweet;
      if(tweet.entities.media!==undefined){
         text = text.replace(tweet.entities.media[0].url, tweet.entities.media[0].display_url);
      }
      if(tweet.entities.urls!=undefined){
        if(tweet.entities.urls.length>0)
        {
          tweet.entities.urls.forEach(function(item, index){
            text = text.replace(item.url, item.display_url);
          });
        }
      }
      return text;
    }
  },
  methods: {
    Noti(){
      var userid=this.$store.state.Account.selectAccount.user_id;
      var mentions=this.tweet.orgTweet.entities.user_mentions;
      for(var i=0;i<mentions.length;i++){
        if(userid==mentions[i].id_str)
          return true;
      }
      var highlight=this.$store.state.DalsaeOptions.highlight;
      if(highlight==undefined) return false;
      for(var i=0;i<highlight.length;i++){
        if(this.tweet.orgTweet.full_text.indexOf(highlight[i])>=0)
          return true;
      }
      return false;
    },
    Focused(){
      this.isFocus=true;
    },
    FocusOut(){
      this.isFocus=false;
    },
    Hover(){
      this.isHover=true;
    },
    HoverOut(){
      this.isHover=false;
    },
    Click(e){
      this.$store.dispatch('Daehwa', this.tweet);
      this.EventBus.$emit('FocusDaehwa');
    },
    propic() {
      var user=undefined;
      if(this.tweet.retweeted_status!=undefined){//리트윗일 경우 인장 표시가 다름
        user=this.tweet.retweeted_status.user;
      }
      else{
        user=this.tweet.user;
      }
      if(user==undefined){
        return '';
      }
      else
      return this.option.isBigPropic
        ? user.profile_image_url_https.replace("_normal", "_bigger")
        : user.profile_image_url_https;
    },
  }
};
</script>

<style lang="scss" scoped>
.qt {
  position: relative;
	background-color: #ffe9e9;
	border-radius: 12px;
  height: auto;
  color: black;
  display: flex;
  padding: 6px;
  align-items: stretch;
  border: solid 1px rgba(0, 0, 0, 0.12);
}
.qt.hover{
  background-color:#a5bbeb;
  cursor: pointer;
}

// .qt:focus{
//   outline: none;
// }

// .tweet-odd{
//   background: #ffe0e0!important;
// }
// .tweet-even{
//   background: hsl(0, 100%, 90%)!important;
// }

// .selected-focus-out{
//   background-color: #f7e2d4 !important;
// }
@mixin profile() {
  object-fit: contain;
  border-radius: 12px;
  margin-bottom: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}
.profile {
  @include profile();
  width: 48px;
}
.profile-big {
  @include profile();
  width: 73px;
}
.tweet-text {
  font-size: 14px;
  flex: 1;
  display: inline-flex;
  flex-direction: column;
  padding: 0px 8px;
  .tweet-name {
    margin-bottom: 2px;
    .tweet-name-content {
      border-radius: 4px;
      font-weight: bold;
    }
    // .protected:after {
      // content: "🔒";
    // }
  }
  .tweet-content {
    flex: 1;
  }
  .tweet-timestamp {
    color: hsla(0, 0, 20, 1.0);
  }
}

.tweet-images-preview {
  position: absolute;
  display: inline-flex;
  right: 120px;
  background: white;
  padding: 4px;
  margin-top: -4px;
  border-radius: 12px;
  
  backdrop-filter: blur(5px);
  :not(:last-child) {
    margin-right: 4px;
  }
}
.tweet-images {
  display: inline-flex;
  cursor: pointer;
  height: 100px;
  border-radius: 12px;
  box-shadow: 0 5px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  :not(:last-child) {
    margin-right: -95px;
  }
}
.tweet-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
}
.retweet-info{
  img{
    width: 25px;
    height: 25px;
    border-radius: 4px;
  }
}
</style>
