function interpolateZoom (translate, scale) {
    var self = this;
    return selection.transition().duration(350)
              .call(zoom.transform, 
                    d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
}
function clickZoom(){
    var clicked = d3.event.target,
    direction = 1,
    factor = 0.1,
    target_zoom = 1,
    center = [window.innerWidth / 2, (window.innerHeight-60) / 2],
    zoom = d3.behavior.zoom(),
    extent = zoom.scaleExtent(),
    translate = d3.zoomTransform(selection.node()), // ADDED
    translate0 = [],
    l = [],
    view = {x: translate.x, y: translate.y, k: translate.k};

    d3.event.preventDefault();
    direction = (this.id === 'zoom_in') ? 1 : -1;
    console.log('DIRECTiON:', direction);
    target_zoom = view.k * (1 + factor * direction);

    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    interpolateZoom([view.x, view.y], view.k);
};    

var graph_area={
    'clicekZoom':function(){
        var clicked = d3.event.target,
        direction = 1,
        factor = 0.1,
        target_zoom = 1,
        center = [window.innerWidth / 2, (window.innerHeight-60) / 2],
        zoom = d3.behavior.zoom(),
        extent = zoom.scaleExtent(),
        translate = d3.zoomTransform(selection.node()), // ADDED
        translate0 = [],
        l = [],
        view = {x: translate.x, y: translate.y, k: translate.k};

        d3.event.preventDefault();
        direction = (this.id === 'zoom_in') ? 1 : -1;
        console.log('DIRECTiON:', direction);
        target_zoom = view.k * (1 + factor * direction);

        if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

        translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
        view.k = target_zoom;
        l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

        view.x += center[0] - l[0];
        view.y += center[1] - l[1];

        interpolateZoom([view.x, view.y], view.k);

    },

    'submit':function(year, group){
        //graph_file='/companydata/group_relation/'+group+'/'+group+'_'+year+'_graph.json';
        graph_file='G1101_2016_graph.json'
        d3.json(graph_file, function(json) {
            function GroupExplorer(wrapper,config){
                var defaultConfig={
                    data:{"nodes":[],"links":[]},
                    width:window.innerWidth,
                    height:window.innerHeight-60,
                    distance:100
                };
                $.extend(true,defaultConfig,config);
                defaultConfig.data.links.forEach(function (e) {
                    if(typeof e.source!="number"&&typeof e.target!="number"){
                        var sourceNode = defaultConfig.data.nodes.filter(function (n) {
                                    return n.name === e.source;
                                })[0],
                                targetNode = defaultConfig.data.nodes.filter(function (n) {
                                    return n.name === e.target;
                                })[0];
                        e.source = sourceNode;
                        e.target = targetNode;
                    }
                });
                var _this=this,highlighted=null,dependsNode=[],dependsLinkAndText=[];
                this.color = d3.scale.category20();
                var zoom = d3.behavior.zoom()
                        .scaleExtent([0.2,10])
                        .on("zoom",function(){
                            _this.zoomed();
                        })

                this.vis = d3.select("body").append("svg:svg")
                        .attr("width", defaultConfig.width)
                        .attr("height", defaultConfig.height)
                        .call(zoom).on("dblclick.zoom", null);

                this.vis=this.vis.append('g').attr('class','all')
                        .attr("width", defaultConfig.width)
                        .attr("height", defaultConfig.height)

                d3.selectAll('button').on('click', graph_area.clickZoom);

                this.force = d3.layout.force()
                        .nodes(defaultConfig.data.nodes)
                        .links(defaultConfig.data.links)
                        .gravity(.0001)
                        .distance(defaultConfig.distance)
                        .charge(function(d){
                            return (-10* d.index)
                        })
                        .size([defaultConfig.width,defaultConfig.height])
                        .start();
                this.vis.append("svg:defs").selectAll("marker")
                        .data(["end"])
                        .enter().append("svg:marker")
                        .attr("id","arrow")
                        .attr('class','arrow')
                        .attr("viewBox", "0 -5 10 10")
                        .attr("refX", 27)
                        .attr("refY", 0)
                        .attr("markerWidth", 9)
                        .attr("markerHeight", 16)
                        .attr("markerUnits","userSpaceOnUse")
                        .attr("orient", "auto")
                        .append("svg:path")
                        .attr("d", "M0,-5L10,0L0,5")
                        .attr('fill','#666');

                this.link = this.vis.selectAll("line.link")
                        .data(defaultConfig.data.links)
                        .enter().append("svg:line")
                        .attr("class", "link")
                        .attr('stroke-width',1)
                        .attr("x1", function(d) {
                            return d.source.x;
                        })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; })
                        .attr("marker-end","url(#arrow)")
                        .attr('stroke','#999');

                var dragstart=function(d, i) {
                    _this.force.stop();
                    d3.event.sourceEvent.stopPropagation();
                };

                var dragmove=function(d, i) {
                    d.px += d3.event.dx;
                    d.py += d3.event.dy;
                    d.x += d3.event.dx;
                    d.y += d3.event.dy;
                    _this.tick();
                };

                var dragend=function(d, i) {
                    d.fixed = true;
                    _this.tick();
                    _this.force.resume();
                };

                this.nodeDrag = d3.behavior.drag()
                        .on("dragstart", dragstart)
                        .on("drag", dragmove)
                        .on("dragend", dragend);

                this.highlightObject=function(obj){
                    if (obj) {
                        if (obj !== highlighted) {
                            var objIndex= obj.index;
                            var depends=[objIndex];
                            defaultConfig.data.links.forEach(function(lkItem){
                                if(objIndex==lkItem['source']['index']){
                                    depends=depends.concat([lkItem.target.index])
                                }else if(objIndex==lkItem['target']['index']){
                                    depends=depends.concat([lkItem.source.index])
                                }
                            });
                            _this.node.classed('inactive',function(d){
                                    return (depends.indexOf(d.index)==-1)
                            });
                            _this.link.classed('inactive', function(d) {
                                return (obj !== d.source && obj !== d.target);
                            });

                            _this.linetext.classed('inactive',function(d){
                                return (d.source.index !=obj.index && d.target.index!=obj.index)
                            });
                        }
                        row="<div class='title'>"+obj.name+"</div><table class='detail-info'>";
                        row+="<tr><td>統一編號: "+obj.taxcode;
                        row+="</td></tr><tr><td>";
                        $.each(obj.source, function(index, dict){
                            row+=dict['name']+': '+dict['holder']+'<br/>';
                        });    
                        row+="</td></tr></table>";
                        _this.tooltip.html(row)
                                .style("left",(d3.event.pageX+20)+"px")
                                .style("top",(d3.event.pageY-20)+"px")
                                .style("opacity",1.0);
                        highlighted = obj;
                    } else {
                        if (highlighted) {
                            _this.node.classed('inactive', false);
                            _this.link.classed('inactive', false);
                            _this.linetext.classed('inactive', false);
                        }
                        _this.tooltip.style("opacity",0.0);
                        highlighted = null;
                    }
                };
                
                this.highlightToolTip=function(obj){
                    if(obj){
                        _this.tooltip.html("<div class='title'>"+obj.name+"的資料</div><table class='detail-info'><tr><td class='td-label'>"+obj.is_core+
                            "</td></tr><tr><td>"+obj.taxcode+"</td></tr></table>")
                                .style("left",(d3.event.pageX+20)+"px")
                                .style("top",(d3.event.pageY-20)+"px")
                                .style("opacity",1.0);
                    }else{
                        _this.tooltip.style("opacity",0.0);
                    }
                };

                this.tooltip=d3.select("body").append("div")
                        .attr("class","tooltip")
                        .attr("opacity",0.0)
                        /*.on('dblclick',function(){
                            d3.event.stopPropagation();
                        })*/
                        .on('mouseover',function(){
                            if (_this.node.mouseoutTimeout) {
                                clearTimeout(_this.node.mouseoutTimeout);
                                _this.node.mouseoutTimeout = null;
                            }
                        })
                        .on('mouseout',function(){
                            if (_this.node.mouseoutTimeout) {
                                clearTimeout(_this.node.mouseoutTimeout);
                                _this.node.mouseoutTimeout = null;
                            }
                            _this.node.mouseoutTimeout=setTimeout(function() {
                                _this.highlightToolTip(null);
                            }, 300);
                        });

                this.node = this.vis.selectAll("g.node")
                        .data(defaultConfig.data.nodes)
                        .enter().append("svg:g")
                        .attr("class", "node")
                        .call(_this.nodeDrag)
                        .on('mouseover', function(d) {
                            if (_this.node.mouseoutTimeout) {
                                clearTimeout(_this.node.mouseoutTimeout);
                                _this.node.mouseoutTimeout = null;
                            }
                            _this.highlightObject(d);
                        })
                        .on('mouseout', function() {
                            if (_this.node.mouseoutTimeout) {
                                clearTimeout(_this.node.mouseoutTimeout);
                                _this.node.mouseoutTimeout = null;
                            }
                            _this.node.mouseoutTimeout=setTimeout(function() {
                                _this.highlightObject(null);
                            }, 300);
                        });
                        /*.on('dblclick',function(d){
                            _this.highlightObject(d);
                            d3.event.stopPropagation();
                        });
                        d3.select("body").on('dblclick',function(){
                            dependsNode=dependsLinkAndText=[];
                            _this.highlightObject(null);
                        
                        });*/

                this.node.append("svg:image")
                        .attr("class", "circle")
                        .attr("xlink:href", function(d) {
                            if (d.is_core==true){
                                image_path='/thaubing_UI/image/core_factory.png';
                            }
                            else{
                                if (d.no_holder==true)
                                    image_path='/thaubing_UI/image/no_holder_factory.png';
                                else if (d.taxcode!='NA')
                                    image_path='/thaubing_UI/image/tw_factory.png';
                                else
                                    image_path='/thaubing_UI/image/other_factory.png';
                            }
                            
                            
                            return image_path;
                        })    
                        .attr("x", "-15px")
                        .attr("y", "-15px")
                        .attr("width", "30px")
                        .attr("height", "30px");

                this.node.append("svg:text")
                        .attr("class", "nodetext")
                        .attr("dy", "30px")
                        .attr('text-anchor','middle')
                        .text(function(d) { return d.name })
                        .attr('fill',function(d,i){
                            return _this.color(i);
                        });

                this.linetext=this.vis.selectAll('.linetext')
                        .data(defaultConfig.data.links)
                        .enter()
                        .append("text")
                        .attr("class", "linetext")
                        .attr("x",function(d){ return (d.source.x + d.target.x) / 2})
                        .attr("y",function(d){ return (d.source.y + d.target.y) / 2})
                        .text(function (d) {
                            return d.relation
                        })
                        .attr('fill',function(d,i){
                            return _this.color(i);
                        })
                        .call(this.force.drag);

                this.zoomed=function(){
                    _this.vis.attr("transform","translate("+d3.event.translate+") scale("+d3.event.scale+")")
                };

                d3.selectAll('button').on('click', this.clickZoom);
                var interpolateZoom=function(translate, scale) {
                    var self = this;
                    return selection.transition().duration(350)
                              .call(zoom.transform, 
                                    d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
                }

                this.clickZoom=function(){
                    var clicked = d3.event.target,
                    direction = 1,
                    factor = 0.1,
                    target_zoom = 1,
                    center = [defaultConfig.width / 2, defaultConfig.height / 2],
                    extent = zoom.scaleExtent(),
                    translate = d3.zoomTransform(selection.node()), // ADDED
                    translate0 = [],
                    l = [],
                    view = {x: translate.x, y: translate.y, k: translate.k};

                    d3.event.preventDefault();
                    direction = (this.id === 'zoom_in') ? 1 : -1;
                    console.log('DIRECTiON:', direction);
                    target_zoom = view.k * (1 + factor * direction);

                    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

                    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
                    view.k = target_zoom;
                    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

                    view.x += center[0] - l[0];
                    view.y += center[1] - l[1];

                    interpolateZoom([view.x, view.y], view.k);
                };    
                
                var findMaxWeightNode=function(){
                    var baseWeight= 1,baseNode;
                    defaultConfig.data.nodes.forEach(function(item){
                        if(item.weight>baseWeight){
                            baseWeight=item.weight
                            baseNode=item
                        }
                    });
                    return baseNode;
                };

                this.tick=function() {
                    var findMaxWeightNodeIndex=findMaxWeightNode().index;
                    defaultConfig.data.nodes[findMaxWeightNodeIndex].x = defaultConfig.width / 2;
                    defaultConfig.data.nodes[findMaxWeightNodeIndex].y = defaultConfig.height / 2;
                    _this.link.attr("x1", function(d) { return d.source.x; })
                            .attr("y1", function(d) { return d.source.y; })
                            .attr("x2", function(d) { return d.target.x})
                            .attr("y2", function(d) { return d.target.y;});
                    _this.linetext.attr("x",function(d){ return (d.source.x + d.target.x) / 2})
                            .attr("y",function(d){ return (d.source.y + d.target.y) / 2});
                    _this.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
                };
                _this.force.on("tick", this.tick);

            }
    
            new GroupExplorer('body',{
                data:json
            });
        });

    }
}    