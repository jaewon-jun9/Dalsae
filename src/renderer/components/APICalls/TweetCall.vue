<template>
  <div class="user-call">
  </div>
</template>

<script>
import {EventBus} from '../../main.js';
import ApiTweet from './TweetCall.js';
import OAuth from '../../OAuth.js'
import axios from 'axios'

export default {
  name: "usercall",
  props: {
  },
  created() {
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
    SendTweet(tweetText, media, replyId){
			ApiTweet.Tweet(tweetText, replyId, media, this.selectAccount.oauth_token, this.selectAccount.oauth_token_secret, this.ResTweet);
    },
    Retweet(tweetId){
      ApiTweet.Retweet(tweetId, this.selectAccount.oauth_token, this.selectAccount.oauth_token_secret, this.ResRetweet, this.ErrRetweet);
		},
		UnRetweet(tweetId){
			ApiTweet.UnRetweet(tweetId, this.selectAccount.oauth_token, this.selectAccount.oauth_token_secret, this.ResUnRetweet, this.ErrRetweet);
		},
		RetryRetweet(tweetId){
			// ApiTweet.Retweet(tweetId, this.selectAccount.oauth_token, this.selectAccount.oauth_token_secret, this.ResRetweet);
		},
		Favorite(tweetId){
			ApiTweet.Favorite(tweetId, this.selectAccount.oauth_token, this.selectAccount.oauth_token_secret, this.ResFavoriet, this.ErrFavorite);
		},
		UnFavorite(tweetId){
			ApiTweet.UnFavorite(tweetId, this.selectAccount.oauth_token, this.selectAccount.oauth_token_secret, this.ResUnFavorite, this.ErrFavorite);
		},
		RetryFavorite(tweetId){
			// ApiTweet.Retweet(tweetId, this.selectAccount.oauth_token, this.selectAccount.oauth_token_secret, this.ResFavoriet);
		},
		DeleteTweet(tweetId){
			ApiTweet.DeleteTweet(tweetId, this.selectAccount.oauth_token, this.selectAccount.oauth_token_secret, this.ResDelete, this.ErrDelete);
		},
    ResTweet(tweet){
			// this.$store.dispatch('SendTweet', tweet);
			console.log('send Tweet ok')
      console.log(tweet);
    },
    ResRetweet(tweet){
			this.$store.dispatch('Retweet', tweet);
			// console.log('retweet ok')
			// console.log(tweet);
		},
		ReqQTTweet(qtId){
			ApiTweet.QTTweet(qtId, this.selectAccount.oauth_token, this.selectAccount.oauth_token_secret, this.ResQT, this.ErrQT);
		},
		ResQT(tweet, qtIdStr){
			this.EventBus.$emit('LoadedQTTweet', {'tweet': tweet, 'id_str': qtIdStr});
		},
		ErrQT(err){
			console.log('qt laod error')

		},
		ResUnRetweet(tweet){
			this.$store.dispatch('UnRetweet', tweet);
			console.log('un retweet ok')
			console.log(tweet);
		},
		ResFavoriet(tweet){
			this.$store.dispatch('Favorite', tweet);
			console.log('favo ok')
			console.log(tweet);
		},
		ResUnFavorite(tweet){
			this.$store.dispatch('UnFavorite', tweet);
			console.log('un favo ok')
			console.log(tweet);
		},
		ResUnFavoriet(tweet){
			this.$store.dispatch('UnFavorite', tweet);
			console.log('un favo ok')
			console.log(tweet);
		},
		ResDelete(tweet){
			this.$store.dispatch('Delete', tweet);
			console.log('delete twwet ok')
			console.log(tweet);
		},
    ErrRetweet(err, tweetID){
      console.log(err);
      this.RetryRetweet(tweetID);
    },
    ErrFavorite(err, tweetID){
      console.log(err);
      this.RetryFavorite(tweetID);
    }
	},
	mounted: function() {//EventBus등록용 함수들
    this.EventBus.$on('SendTweet', (vals) => {
			this.SendTweet(vals['text'], vals['media'], vals['replyId']);
    });
    this.EventBus.$on('Retweet', (tweet) => {
			if(tweet.orgTweet.retweeted){
        this.UnRetweet(tweet.orgTweet.id_str);
      }
      else{
				this.Retweet(tweet.orgTweet.id_str);
      }
		});
		this.EventBus.$on('Favorite', (tweet) => {
			if(tweet.orgTweet.favorited){
        this.UnFavorite(tweet.orgTweet.id_str);
      }
      else{
				this.Favorite(tweet.orgTweet.id_str);
      }
		});
		this.EventBus.$on('LoadQTTweet',(tweet)=>{
			this.ReqQTTweet(tweet.orgTweet.quoted_status_id_str);
		});
		this.EventBus.$on('DeleteTweet', (tweet)=>{
			if(tweet.orgUser.id_str==this.selectAccount.userData.id_str){
				this.DeleteTweet(tweet.orgTweet.id_str);
			}
		});
	},
};
</script>

<style lang="scss">

</style>
