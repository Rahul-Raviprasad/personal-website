/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load('particles-js', 'assets/particles.json', function() {
  console.log('callback - particles.js config loaded');
});


//D3 Chart

var diameter = 660,
  radius = diameter / 2,
  innerRadius = radius - 120;

var cluster = d3.layout.cluster()
  .size([360, innerRadius])
  .sort(null)
  .value(function(d) { return d.size; });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
  .interpolate("bundle")
  .tension(.85)
  .radius(function(d) { return d.y; })
  .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select("#edge-bundling").append("svg")
  .attr("width", diameter)
  .attr("height", diameter)
  .append("g")
  .attr("transform", "translate(" + radius + "," + radius + ")");

var link = svg.append("g").selectAll(".link"),
  node = svg.append("g").selectAll(".node");

var classes = [
  {	"name":"experience.4+Years", "size":139, "imports":[]},
  {	"name":"experience.3+Years", "size":139, "imports":[]},
  {	"name":"experience.2+Years", "size":139, "imports":[]},
  {	"name":"experience.1+Year", "size":39, "imports":[]},
  {	"name":"experience.New", "size":39, "imports":[]},

  {	"name":"character.Awesome","size":600, "imports":[]},
  {	"name":"character.Don't_Mind","size":600, "imports":[]},
  {	"name":"character.Good","size":600, "imports":[]},
  {	"name":"character.OK","size":600, "imports":[]},

  {	"name":"technology.JavaScript", "size":600, "imports":["experience.4+Years", "character.Awesome"]},
  {	"name":"technology.JQuery", "size":600, "imports":["technology.JavaScript", "experience.1+Year", "character.Good"]},
  {	"name":"technology.Angular", "size":600, "imports":["technology.JavaScript", "experience.2+Years", "character.Awesome"]},
  {	"name":"technology.D3", "size":600, "imports":["technology.JavaScript", "character.OK"]},
  {	"name":"technology.Java", "size":1600, "imports":["experience.4+Years", "character.Awesome"]},
  {	"name":"technology.Scala", "size":1600, "imports":["experience.New", "character.Don't_Mind"]},
  {	"name":"technology.Node", "size":1600, "imports":["technology.JavaScript", "experience.1+Year", "character.Good"]},
  {	"name":"technology.Python", "size":1600, "imports":["experience.2+Years", "character.Good"]}
];

  var nodes = cluster.nodes(packageHierarchy(classes)),
    links = packageImports(nodes);

  link = link
    .data(bundle(links))
  .enter().append("path")
    .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
    .attr("class", "link")
    .attr("d", line);

  node = node
    .data(nodes.filter(function(n) { return !n.children; }))
  .enter().append("text")
    .attr("class", "node")
    .attr("dy", ".31em")
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
    .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .text(function(d) { return d.key; })
    .on("mouseover", mouseovered)
    .on("mouseout", mouseouted);


function mouseovered(d) {
  node
    .each(function(n) { n.target = n.source = false; });

  link
    .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
    .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
  .filter(function(l) { return l.target === d || l.source === d; })
    .each(function() { this.parentNode.appendChild(this); });

  node
    .classed("node--target", function(n) { return n.target; })
    .classed("node--source", function(n) { return n.source; });
}

function mouseouted(d) {
  link
    .classed("link--target", false)
    .classed("link--source", false);

  node
    .classed("node--target", false)
    .classed("node--source", false);
}

d3.select(self.frameElement).style("height", diameter + "px");

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  var map = {};

  function find(name, data) {
  var node = map[name], i;
  if (!node) {
    node = map[name] = data || {name: name, children: []};
    if (name.length) {
    node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
    node.parent.children.push(node);
    node.key = name.substring(i + 1);
    }
  }
  return node;
  }

  classes.forEach(function(d) {
  find(d.name, d);
  });

  return map[""];
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {},
    imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
  map[d.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
  if (d.imports) d.imports.forEach(function(i) {
    imports.push({source: map[d.name], target: map[i]});
  });
  });

  return imports;
}
