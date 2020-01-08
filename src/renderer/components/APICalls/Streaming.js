function GetHeader(vuex, param){
	OAuth.GetHeader(param.param, param.method, param.url);
}

import axios from 'axios'
import OAuth from '../../OAuth.js'

export default{
	ConnectStreaming(publickey, secretkey){
		console.log('called stream connect')
		var url='http://userstream.twitter.com/1.1/user.json';
		// var url='http://127.0.0.1:51443/2794087284';
		var method='GET';
		var arr=[];
		axios({
			method:method,
			url:url,
			proxy: {
				host: 'http://localhost',
				port: 8811,
				auth: {
					username: '',
					password: ''
				}
			},
			headers:{
				'Content-Type':'application/x-www-form-urlencoded;encoding=utf-8',
				'Authorization': OAuth.GetHeader(arr, method, url, publickey, secretkey)
			},
		}).then((res)=>{
			console.log('streaming ok~')
			console.log(res);
			// console.log('get userinfo ok');
			// callback(res.data);
		}).catch((err)=>{
			console.log('streaming connect error!');
			// console.log(err);
		});
	},
}