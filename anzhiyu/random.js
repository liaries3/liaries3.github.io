var posts=["2025/06/28/anbujiuban/","2025/06/27/xingce1/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };