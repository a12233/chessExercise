<template>
<body class="container">
<nav class="navbar navbar-default" role="navigation">
    <div class="container-fluid">
    
        <div class="navbar-header">
            <a class="navbar-brand" href="/">
                <span class="glyphicon glyphicon glyphicon-tree-deciduous"></span>
                Chess Analytics and Visualizations 
            </a>
            <ul class="nav navbar-nav">
                <li><a href="/board">Static Board</a></li>
                <li><a href="/latestGame">Latest Game</a></li>
                <li><a href="/test">Game Review</a></li>
                <li><a href="/db">Database</a></li>
                <li><a href="/playStockfish">Play Stockfish</a></li>
            </ul>
        </div>
        
    </div>
    </nav>
</body>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
