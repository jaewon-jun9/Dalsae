<template>
	<div ref="imgModal" class="image-modal" tabindex="-1" @keydown.esc="KeyDownEsc" @keydown="KeyDown" @keydown.left="Prev" @keydown.right="Next">
		<div class="img-bg">
			<Tweet v-show="uiOption.isShowTweet" :tweet="tweet" :option="uiOption" class="tweet-odd"/>
			<div class="image-content">
				<div class="arrow" v-if="tweet.orgTweet.extended_entities.media.length > 1 && !isZoom">
					<div class="left-button">
						<i class="fas fa-chevron-left fa-2x" @click="Prev"></i>
					</div>
					<div class="right-button">
						<i class="fas fa-chevron-right fa-2x" @click="Next"></i>
					</div>
				</div>
				<div ref="imgDiv" v-show="i==index" v-for="(image,i) in tweet.orgTweet.extended_entities.media" :key="i" class="img-div">
					<img ref="img" :src="ImgPath(image.media_url_https)" class="img-content" :class="{'zoom':isZoom}"
					:style="{'margin-left':isZoom ? marginLeft+'px' : 'auto', 'margin-top': isZoom ? marginTop+'px' : 'auto'}"
					@mousedown="MouseDown" @mouseleave="MouseLeave" @mouseup="MouseUp" @mousemove="MouseMove"/>
				</div>
			</div>
			<div class="bottom">
				<div v-for="(image,i) in tweet.orgTweet.extended_entities.media" @click="index=i"
					:key="i" class="img-preview">
						<img :src="image.media_url_https" class="bottom-preview"/>
						<ProgressBar ref="progress" :percent="listProgressPercent[i]"/>
					</div>
			</div>
		</div>
		<ContextMenu ref="context" :index="index" :images="tweet.orgTweet.extended_entities.media"/>
	</div>
</template>
<script>
import JQuery from 'jquery'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import BootStrap from "bootstrap"
import ApiOAuth from "../APICalls/OAuthCall.js"
import Tweet from "../Tweet/Tweet.vue"
import {EventBus} from '../../main.js';
import ImagePopupVue from './ImagePopup.vue'
import ProgressBar from '../Common/ProgressBar.vue'
import ContextMenu from '../ContextMenu/ImageContextMenu.vue'

export default {
	name: 'imagemodal',
	components:{
		Tweet,
		ProgressBar,
		BootStrap,
		Tweet,
		ContextMenu
	},
  data () {
    return {
			listProgressPercent:Array(0,0,0,0),
			isZoom:false,
			tweet:undefined,
			index:0,
			isDrag:false,
			prevX:0,
			prevY:0,
			startX:0,
			startY:0,
			marginLeft:0,
			marginTop:0,
    }
	},
	props:{
		uiOption:undefined,
	},
	created: function(){
		this.EventBus.$on('Save', ()=>{
			this.Save();
		});
		this.EventBus.$on('SaveAll', ()=>{
			this.SaveAll();
		});
	},
  mounted:function(){
		console.log(this.tweet);
	},
	mounted(){
		setTimeout(() => this.$el.focus(), 200);
	},
	methods:{
 		Save(){
			this.DownloadImage(this.tweet.orgTweet.extended_entities.media[this.index], this.$refs.progress[this.index]);
    },
    SaveAll(){
			for(var i=0;i<this.tweet.orgTweet.extended_entities.media.length;i++)
				this.DownloadImage(this.tweet.orgTweet.extended_entities.media[i], this.$refs.progress[i]);
		},
		DownloadImage(media, progress){
			//progress show, hide 해야 함
			var http = require('http');
			var url = media.media_url;
			var fs = require('fs');
			var fileName = url.substring(url.lastIndexOf('/'),9999999999);
			var file = fs.createWriteStream('Image/'+fileName);

			const request = http.get(url).on('response', function(res) {
      const len = parseInt(res.headers['content-length'], 10)
      let downloaded = 0
			let percent = 0
			var vthis=this;
      res
        .on('data', function(chunk) {
          file.write(chunk)
          downloaded += chunk.length
					percent = (100.0 * downloaded / len).toFixed(2)
					progress.SetValue(percent);
        })
        .on('end', function() {
					file.end()
					console.log('down ok~')
        })
        .on('error', function (err) {
					console.log('img down error!!!')
					console.log(err)
        })
    	})
		},
		Prev(){
			this.isZoom=false;
			this.index--;
			if(this.index<0)
				this.index=0;
		},
		Next(){
			this.isZoom=false;
			this.index++;
			if(this.index >= this.tweet.orgTweet.extended_entities.media.length)
				this.index--;
		},
		ImgPath(org){
			if(this.uiOption.isLoadOrgImg){
				return org+':orig';
			}
			else{
				return org;
			}
		},
		MouseDown(e){
			e.preventDefault()
			if(e.button==2 || e.button==3){//우클릭
				this.$refs.context.Show(e);
			}
			if(e.button==0){//왼클릭
				if(this.isZoom){
					this.isDrag=true;
				}
				this.prevX=e.pageX;
				this.prevY=e.pageY;
				this.startX=e.pageX;
				this.startY=e.pageY;
			}
		},
		MouseLeave(e){
			this.isDrag=false;
		},
		MouseUp(e){
			if(e.pageX == this.startX && e.pageY == this.startY){//클릭일 경우 확대 변경
				var div = this.$refs.imgDiv[this.index];
				var img = this.$refs.img[this.index];
				if(div.clientHeight<=img.clientHeight || div.clientWidth <= img.clientWidth){//img가 그림 배경보다 클 경우에만 zoom동작
					this.isZoom=!this.isZoom;
					this.marginLeft=0;//margin도 초기화 
					this.marginTop=0;
				}
			}
			this.isDrag = false;
		},
		MouseMove(e){
			if(this.isDrag){
				var y = e.pageY-this.prevY;
				var x = e.pageX-this.prevX;
				this.prevX=e.pageX;
				this.prevY=e.pageY;
				this.marginLeft+=x;
				this.marginTop+=y;
				// if(this.marginLeft<0)
				// 	this.marginLeft=0;
				// if(this.marginTop<0);
				// 	this.marginTop=0;
			}
		},
		KeyDownEsc(e){
			console.log('esc~~~')
			this.EventBus.$emit('HideTweetImage')
		},
		KeyDown(e){
			console.log(e);
			console.log('esc~~~')
			// this.EventBus.$emit('HideTweetImage')
		},
		CloseClick(e){
			this.EventBus.$emit('HideTweetImage');
		},
		SetTweet(tweet){
			console.log(JSON.stringify(tweet))
			this.tweet=tweet;
		},
	}
}
</script>
<style lang="scss" scoped>
.image-modal{
	z-index: 999;
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	padding: 20px;
	overflow: none;
	background-color: rgba(0, 0, 0, 0.7);
}
.img-bg{
	background-color: rgba(0, 0, 0, 0.7);
	// overflow: auto;
}
.tweet{
	border-radius: 10px;
}
.image-content{
	height: 100%;
	border-radius: 10px;
	overflow-y: scroll;
	overflow-x: scroll;
	overflow: hidden;
	margin:auto;
	.img-div{
		height: calc(100vh - 300px);
		display:flex;
		justify-content: center;
		align-items: center;
		.img-content{
			display: block;
			object-fit: scale-down;
			margin: auto;
			max-width: 100%;
			max-height: 100%;
			height: auto;
			cursor: pointer;
			// vertical-align: middle;
			.zoom{
				object-fit: cover;
				max-width: none !important;
				max-height: none !important;
			}
		}
	}
}
.img-content.zoom{
	object-fit: cover;
	max-width: none !important;
	max-height: none !important;
}
.d-block{
	vertical-align: middle;
	margin: auto !important;
}
.carousel-inner{
	height: 100%;
	border-radius: 10px;
	overflow-y: scroll;
	overflow-x: scroll;
}
.carousel-item {
	height: calc(100vh - 300px);
}
.bottom{
	height: 100px;
	.img-preview{
		display: inline-block;
		flex-direction: column;
		width: 25%;
		// height: 25%;
		width: 100px;
		height: 100px;
		max-height: 100px;
		max-width: 25%;
		.bottom-preview{
			  width: 100px;
				height: 100px;
				object-fit: cover;
				border-radius: 12px;
		}
		progress{
			width: 100px;
		}
	}
}
.right-button{
	position:absolute;
	right:20px;
	top:50%;
	color:white;
}
.left-button{
	position:absolute;
	left:20px;
	top:50%;
	color:white;
}
</style>
