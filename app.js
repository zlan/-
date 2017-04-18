var eventproxy = require('eventproxy');//	并发代理器
var superagent = require('superagent');//访问代理
var cheerio = require('cheerio');//获取页面内容，相当于jquery
var express=require('express'); // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
var app=new express();
// url 模块是 Node.js 标准库里面的
// http://nodejs.org/api/url.html
var url = require('url');
var linkAll=[];
app.get('/',function(req,response,next){
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
var cnodeUrl = 'https://cnodejs.org/';
superagent.get(cnodeUrl)
  .end(function (err, res) {
    if (err) { return console.error(err);}
    var topicUrls = []; // 获取优酷大陆剧的所有的链接
for(var i=1; i<=30;i++){
	if(i==1){
		url='http://list.youku.com/category/show/c_97_a_大陆_s_1_d_1.html';
	}else{
		url='http://list.youku.com/category/show/c_97_a_大陆_s_1_d_1_p_'+i+'.html'
	}
topicUrls.push(url);
}
// 得到一个 eventproxy 的实例
//  
var ep = new eventproxy();
		/****************************/
		// 命令 ep 重复监听 topicUrls.length 次 `topic_html` 事件再行动
		ep.after('topic_html', topicUrls.length, function (topics) {
		  // topics 是个数组，包含了 30 次 ep.emit('topic_html', pair) 中的那 30 个 pair

		  // 开始行动

		topics.map(function (topicPair) {
		    // 接下来都是 jquery 的用法了
		    var topicUrl = topicPair[0];
		    var topicHtml = topicPair[1];
		    var $ = cheerio.load(topicHtml);
		    /**/
		    var items=[];
		    	      $('.yk-pack .p-thumb a').each(function (idx, element) {
				        var $element = $(element);
				        items.push({
				          title: $('.yk-pack .p-thumb a').eq(idx).attr('title'),
		      			  href: $('.yk-pack .p-thumb a').eq(idx).attr('href'),
				        });
				      });

		    /**/
		    linkAll.push(items);
		    console.log(items);
		    console.log('*************'+topicUrl+'**************');
		    if(linkAll.length>=30){
		    	response.send(linkAll);
		    }
		    return items;
		  });

		});

		/****************************/
		topicUrls.forEach(function (topicUrl) {
		  superagent.get(topicUrl)
		    .end(function (err, res) {
		      ep.emit('topic_html', [topicUrl, res.text]);
		    });
		});
		/****************************/
		
  });

})
app.listen(3000,function(req,res){
	console.log('app is running at port 3000');
})
