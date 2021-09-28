(this["webpackJsonptest-visualization"]=this["webpackJsonptest-visualization"]||[]).push([[0],{142:function(e,t,n){e.exports=n(259)},245:function(e,t,n){},248:function(e,t,n){},249:function(e,t,n){},251:function(e,t,n){},252:function(e,t,n){},253:function(e,t,n){},254:function(e,t,n){},255:function(e,t,n){},257:function(e,t,n){},258:function(e,t,n){},259:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),s=n(11),i=n.n(s),o=n(33),c=n(5),l=n(35),u=n(111),d=n.n(u),h=n(112),f=n.n(h),m=(n(245),function(){var e=Object(a.useState)(null),t=Object(l.a)(e,2),n=t[0],s=t[1];return Object(a.useEffect)((function(){f.a.get("".concat("/morpheus","/content/about.md")).then((function(e){return e.data})).then((function(e){return s(e)})).catch(console.error)})),r.a.createElement("div",{className:"content-wrapper"},r.a.createElement(d.a,{source:n}))}),p=n(34),g=n.n(p),v=n(84),y=n(23),_=n(24),b=n(16),x=n(30),k=n(29),E=n(119),w=function(e){return Object(E.a)("".concat("/morpheus","/resources/").concat(e,".json")).then((function(e){return{methods:e.coverage.methods.map((function(e){return e.get_id=function(){return e.method_id},e.to_string=function(){return"".concat(e.package_name,".").concat(e.class_name," ").concat(e.method_decl)},e.get_cluster=function(){return e.hasOwnProperty("cluster_id")?e.cluster_id:0},e.get_color=function(){return e.package_name},e})),tests:e.coverage.tests.map((function(e){return e.get_id=function(){return e.test_id},e.to_string=function(){return"".concat(e.class_name," ").concat(e.method_name)},e.get_cluster=function(){return e.hasOwnProperty("cluster_id")?e.cluster_id:0},e.get_color=function(){return e.class_name},e})),edges:e.coverage.edges.map((function(e){return e.get_color=function(){switch(e.test_result){case"P":return"#03C03C";case"F":return"#FF1C00";default:return"black"}},e.get_x=function(){return e.method_id},e.get_y=function(){return e.test_id},e}))}})).catch(console.error)},j=n(289),O=n(287),S=n(286),C=n(46),T=n.n(C),M=n(290),I=n(293),N=n(116),A=n(284),P=n(19),F=n(285),z=n(294),R=n(36),U=n(53),D=function(e){Object(x.a)(n,e);var t=Object(k.a)(n);function n(e){var a;return Object(y.a)(this,n),(a=t.call(this)).ref=r.a.createRef(),a.state={width:0,height:0},a.margin={top:50,left:50,right:0,bottom:0},a.labelToggle=!!e.hasOwnProperty("labelToggle")&&e.labelToggle,a.createMatrix=a.createMatrix.bind(Object(b.a)(a)),a.createTestMatrixView=a.createTestMatrixView.bind(Object(b.a)(a)),a.update=a.update.bind(Object(b.a)(a)),a.onMethodClick=e.onMethodClick,a.onTestClick=e.onTestClick,a.onRightClick=e.onRightClick,a}return Object(_.a)(n,[{key:"createMatrix",value:function(){var e={x:this.props.x,y:this.props.y,edges:this.props.edges};if(0===e.x.length||0===e.y.length)return{x_labels:[],y_labels:[],nodes:[]};var t=[];return console.log(e),e.edges.forEach((function(e,n){if(null!==e.get_y()&&null!==e.get_x()){var a=!!e.hasOwnProperty("highlight")&&e.highlight;t.push({x:parseInt(e.get_x()),y:parseInt(e.get_y()),z:e.get_color(),highlight:a})}})),{x_labels:e.x,y_labels:e.y,nodes:t}}},{key:"componentDidMount",value:function(){var e=this;window.addEventListener("resize",(function(){setTimeout(500),e.setState({width:e.ref.current.parentElement.offsetWidth,height:e.ref.current.parentElement.offsetHeight},e.update)})),this.createTestMatrixView()}},{key:"componentDidUpdate",value:function(e,t,n){if(null!==this.ref.current){var a=this.ref.current.parentElement.offsetWidth,r=this.ref.current.parentElement.offsetHeight;this.state.width===a&&this.state.height===r||(console.log("COMPONENT DID UPDATE "),this.setState({width:a,height:r},this.update))}Object(R.isEqual)(e.x,this.props.x)&&Object(R.isEqual)(e.y,this.props.y)||(this.labelToggle=this.props.labelToggle,this.onMethodClick=this.props.onMethodClick,this.onTestClick=this.props.onTestClick,this.update())}},{key:"update",value:function(){var e=this.ref.current,t=Object(A.a)(e),n=this.createMatrix(),a=3*n.x_labels.length,r=3*n.y_labels.length;t.attr("viewBox",[0,0,this.state.width,this.state.height]);var s=Object(U.a)().on("zoom",(function(e){Object(A.a)("svg g").attr("transform",e.transform)}));t.call(s),Object(A.a)("svg g").attr("transform","translate(0,0) scale(1.0)");var i=a-this.margin.left-this.margin.right-10,o=r-this.margin.top-this.margin.bottom-10,c=Object(I.a)().padding(.5).range([0,i]),l=c.copy().domain(n.x_labels.map((function(e){return parseInt(e.get_id())}))),u=c.copy().domain(n.x_labels.map((function(e){return e.to_string()}))),d=Object(I.a)().padding(.5).range([0,o]),h=d.copy().domain(n.y_labels.map((function(e){return e.get_id()}))),f=d.copy().domain(n.y_labels.map((function(e){return e.to_string()})));function m(e,t){return function(n,a){return n="",e||(n=""),a%t!==0?" ":n}}u.step()!==l.step()&&console.error("xLabel and xScale step are not equal..."),f.step()!==h.step()&&console.error("yLabel and yScale step are not equal...");var p=t.select(".tooltip").style("visibility","visible");function g(e){p.select("text").style("opacity",1),Object(A.a)(this).style("stroke","black")}function v(){var e=Object(A.a)(this).datum(),t="";t=void 0===e.x?"".concat(e.class_name,".").concat(e.method_name):_(e),p.select("text").attr("x",parseFloat(Object(A.a)(this).attr("x"))+60).attr("y",parseFloat(Object(A.a)(this).attr("y"))+60).html(t)}function y(e){p.select("text").style("opacity",0),Object(A.a)(this).style("stroke","none")}function _(e){var t,a,r,s=n.x_labels.find((function(t){return t.method_id===e.x})),i=null!==(t=null===s||void 0===s?void 0:s.method_name)&&void 0!==t?t:"unknownMethod",o=null!==(a=null===s||void 0===s?void 0:s.class_name)&&void 0!==a?a:"UnknownClass",c=n.y_labels.find((function(t){return t.test_id===e.y})),l=null!==(r=null===c||void 0===c?void 0:c.method_name)&&void 0!==r?r:"unknown test";return"".concat(o,".").concat(i," tested by ").concat(l)}p.append("text").attr("id","tooltip-text").attr("dominant-baseline","auto").attr("text-anchor","start").attr("stroke","grey").attr("stroke-opacity","0.3").attr("stroke-width","5").attr("fill","black").style("font-size","12px").style("opacity",0).html("");var b=n.x_labels.length<=20?1:n.x_labels.length/20,x=n.y_labels.length<=20?1:n.x_labels.length/20,k=n.x_labels.length<=20&&this.labelToggle,E=n.y_labels.length<=20&&this.labelToggle,w=Object(M.b)().tickFormat(m(k,b)).scale(u),j=Object(M.a)().tickFormat(m(E,x)).scale(f),O=Object(P.b)().duration(0).ease(F.a),S=u.step(),C=f.step(),T=Object(A.a)("g.testmatrix").attr("transform","translate(".concat(this.margin.left,", ").concat(this.margin.top,")")).selectAll(".cell").data(n.nodes).join((function(e){return e.append("rect").call((function(e){return e.transition(O).attr("x",(function(e){return l(e.x)-S/2})).transition(O).attr("y",(function(e){return h(e.y)-C/2}))}))}),(function(e){return e.call((function(e){return e.transition(O).attr("x",(function(e){return l(e.x)-S/2})).transition(O).attr("y",(function(e){return h(e.y)-C/2}))}))}),(function(e){return e.remove()})).attr("class","cell").attr("fill",(function(e){return e.z})).attr("width",S).attr("height",C).attr("rx",Math.max(1,l.step()/2)).attr("stroke",(function(e){return e.highlight?"black":null})).attr("stoke-width",(function(e){return e.highlight?"1px":"0px"})).on("mouseover",g).on("mousemove",v).on("mouseleave",y);T.selectAll("*").remove(),T.append("title").text(_),Object(A.a)("g.x-axis").attr("transform","translate(".concat(this.margin.left,", ").concat(this.margin.top,")")).call(w).selectAll("line").style("stroke","white").style("stroke-width","0.0"),Object(A.a)("g.x-axis").select("path").style("stroke","grey").style("stroke-width","0.5");var R=S-.1*S,D=Object(A.a)("g.x-axis").selectAll(".axis-dots-x").data(n.x_labels).join((function(e){return e.append("rect").call((function(e){return e.attr("x",(function(e){return"".concat(u(e.to_string())-R/2,"px")}))}))}),(function(e){return e.call((function(e){return e.attr("x",(function(e){return"".concat(u(e.to_string())-R/2,"px")}))}))}),(function(e){return e.remove()})).attr("class","axis-dots-x").attr("y",-10).attr("height",10).attr("width",R).style("stroke","black").style("stroke-width","0.0").style("fill",(function(e){return function(e){return Object(N.a)(z.a).domain(Array.from(new Set(n.x_labels.map((function(e){return e.get_color()})))))(e)}(e.get_color())})).on("click",this.onMethodClick).on("contextmenu",this.onRightClick).on("mouseover",g).on("mousemove",v).on("mouseleave",y);D.selectAll("*").remove(),D.append("title").text((function(e){return"".concat(e.class_name,".").concat(e.method_name)})),Object(A.a)("g.y-axis").attr("transform","translate(".concat(this.margin.left,", ").concat(this.margin.top,")")).call(j).selectAll("line").style("stroke","white").style("stroke-width","0.0"),Object(A.a)("g.y-axis").select("path").style("stroke","grey").style("stroke-width","0.5");var L=C-.1*C,V=Object(A.a)("g.y-axis").selectAll(".axis-dots-y").data(n.y_labels).join((function(e){return e.append("rect").call((function(e){return e.attr("y",(function(e){return"".concat(f(e.to_string())-L/2,"px")}))}))}),(function(e){return e.call((function(e){return e.attr("y",(function(e){return"".concat(f(e.to_string())-L/2,"px")}))}))}),(function(e){return e.remove()})).attr("class","axis-dots-y").attr("x",-10).attr("width",10).attr("height",L).style("stroke","black").style("stroke-width","0").style("fill",(function(e){return function(e){return Object(N.a)(z.a).domain(Array.from(new Set(n.y_labels.map((function(e){return e.get_color()})))))(e)}(e.get_color())})).on("click",this.onTestClick).on("mouseover",g).on("mousemove",v).on("mouseleave",y);V.selectAll("*").remove(),V.append("title").text((function(e){return"".concat(e.class_name,".").concat(e.method_name)})),t.select(".xlabel").attr("x",this.state.width/2).attr("y",11).style("text-anchor","middle").text(this.props.xlabel),t.select(".ylabel").attr("transform","rotate(-90)").attr("y",1).attr("x",-this.state.height/2).attr("dy","0.7em").style("text-anchor","middle").text(this.props.ylabel)}},{key:"createTestMatrixView",value:function(){var e=this.ref.current,t=Object(A.a)(e);t.attr("viewBox",[0,0,this.state.width,this.state.height]);var n=t.append("g");n.append("g").attr("class","x-axis"),n.append("g").attr("class","y-axis"),n.append("g").attr("class","testmatrix"),n.append("g").attr("class","tooltip"),t.append("text").attr("class","xlabel"),t.append("text").attr("class","ylabel")}},{key:"render",value:function(){return r.a.createElement("div",{id:"visualization"},r.a.createElement("svg",{ref:this.ref}))}}]),n}(a.Component),L=(n(248),function(e){Object(x.a)(n,e);var t=Object(k.a)(n);function n(e){var a;return Object(y.a)(this,n),(a=t.call(this)).state={entries:e.entries,display:e.entries},a}return Object(_.a)(n,[{key:"componentDidUpdate",value:function(e,t,n){e.entries!==this.props.entries&&this.setState({entries:this.props.entries,display:this.props.entries})}},{key:"filterFunction",value:function(e){var t=this.state.entries,n=e.target.value;if(""!==n){var a=t.filter((function(e){return e.to_string().toLowerCase().includes(n.toLowerCase())}));this.setState({display:a})}else this.setState({display:this.state.entries})}},{key:"render",value:function(){return r.a.createElement("div",null,r.a.createElement("span",null," ",this.props.title," "),r.a.createElement("div",{className:"filtermenu"},r.a.createElement("div",{className:"dropdown-content"},r.a.createElement("input",{type:"text",placeholder:"Search...",onKeyUp:this.filterFunction.bind(this)}),r.a.createElement("select",{onChange:this.props.onClick},r.a.createElement("option",null," -- select an option -- "),this.state.display.map((function(e){return r.a.createElement("option",{key:e.get_id(),value:e.get_id()},e.to_string())}))))))}}]),n}(a.Component)),V=n(288),G=n(118),Y=n.n(G),q=(n(249),function(e){var t=e.title,n=void 0===t?"":t,s=e.description,i=void 0===s?[]:s,o=e.onChange,c=void 0===o?function(e){return console.log(e.target.value)}:o,u=e.entries,d=void 0===u?[]:u,h=e.reset,f=e.updateReset,m=Object(a.useState)("default"),p=Object(l.a)(m,2),g=p[0],v=p[1],y=0===i.length?null:r.a.createElement(V.a,{title:r.a.createElement("div",{className:"content"}," ",i.map((function(e,t){return r.a.createElement("div",{key:t},e)})))},r.a.createElement(Y.a,{fontSize:"small"}));return Object(a.useEffect)((function(){h&&v("default")}),[h]),r.a.createElement("div",{className:"menu-selector"},r.a.createElement("span",null,n,": "),y,r.a.createElement("select",{value:g,onChange:function(e){!0===h&&f(),v(e.target.value),c(e)}},r.a.createElement("option",{value:"default"}," -- select an option -- "),d.map((function(e){return r.a.createElement("option",{key:e.key,value:e.value},e.value)}))))}),B=(n(251),function(e){return r.a.createElement("div",{className:"result-text-box"},r.a.createElement("span",null,e.title,":"),r.a.createElement("textarea",{value:e.entries.map((function(e,t){return"".concat(t+1,". ").concat(e.to_string())})).join("\n"),readOnly:!0}))});n(252);function H(e,t,n){var a=new Map;return e.forEach((function(e){var r=t(e),s=n(e);if(a.has(r)){var i=a.get(r);i.add(s),a.set(r,i)}else{var o=new Set;o.add(s),a.set(r,o)}})),a}function J(e,t,n){function a(e,t){var n=e.x,a=e.y,r=e.edges.filter(t),s=r.map((function(e){return e.test_id}));return{x:n,y:a.filter((function(e){return s.includes(e.test_id)})),edges:r}}var r;switch(n){case Q.PASS:console.info("Filter all test methods that fail Index: ".concat(n,", was chosen.")),r=a(e,(function(e){return"P"===e.test_result}));break;case Q.FAIL:console.info("Filter all test methods that pass Index: ".concat(n,", was chosen.")),r=a(e,(function(e){return"F"===e.test_result}));break;default:console.info("No methods have been filtered. Index: ".concat(n,", was chosen.")),r=e}return r}function W(e,t,n){var a=e,r=a.x,s=a.y,i=a.edges,o=s.find((function(e){return e.to_string().includes(n)}));if(void 0===o&&(o=s.find((function(e){return e.get_id()===parseInt(n)}))),void 0===o)return console.error("Filter Method was not found..."),a;var c=o.get_id(),l=i.filter((function(e){return c===e.test_id})).map((function(e){return e.method_id})),u=r.filter((function(e){return l.includes(e.method_id)})),d=i.filter((function(e){return l.includes(e.method_id)||e.test_id===c}));d.forEach((function(e){e.test_id===c&&(e.highlight=!0)}));var h=d.map((function(e){return e.test_id}));return{x:u,y:s.filter((function(e){return h.includes(e.test_id)})),edges:d}}function K(e,t,n){var a;switch(n){case X.UNIT:a=function(e,t){return 1===t.size};break;case X.INTEGRATION:a=function(e,t){return 1===e.size&&t.size>1};break;case X.SYSTEM:a=function(e,t){return e.size>1};break;default:return e}return function(e,t,n){var a=e.x,r=new Map;a.forEach((function(e){r.set(e.method_id,e)}));var s,i,o,c=e.edges,l=H(t.edges,(function(e){return e.test_id}),(function(e){return e.method_id})),u=e.y;return s=u.filter((function(e){var t=e.test_id,a=l.get(t),s=new Set,i=new Set;return a.forEach((function(e){var t=r.get(e);void 0!==t&&(s.add("".concat(t.package_name)),i.add("".concat(t.package_name,".").concat(t.class_name)))})),n(s,i)})),o=s.map((function(e){return e.test_id})),i=c.filter((function(e){return o.includes(e.test_id)})),{x:a,y:s,edges:i}}(e,t,a)}var X={UNIT:"Unit",INTEGRATION:"Integration",SYSTEM:"System"},Q={PASS:"Only Pass",FAIL:"Only Fail"};function Z(e,t,n){var a=H(e.edges,(function(e){return e.method_id}),(function(e){return e.test_id})),r=e.x.filter((function(e){var t=e.get_id();return 0===n||a.has(t)&&a.get(t).size>=n})),s=e.edges.filter((function(e){var t=e.method_id;return 0===n||a.has(t)&&a.get(t).size>=n}));return{x:r,y:e.y,edges:s}}function $(e,t,n){var a=e,r=a.x,s=a.y,i=a.edges,o=r.find((function(e){return e.to_string().includes(n)}));if(void 0===o&&(o=r.find((function(e){return e.get_id()===parseInt(n)}))),void 0===o)return console.error("Filter Method was not found..."),a;var c=o.get_id(),l=i.filter((function(e){return c===e.method_id})).map((function(e){return e.test_id})),u=s.filter((function(e){return l.includes(e.test_id)})),d=i.filter((function(e){return l.includes(e.test_id)||e.method_id===o.method_id}));d.forEach((function(e){e.method_id===c&&(e.highlight=!0)}));var h=d.map((function(e){return e.method_id}));return{x:r.filter((function(e){return h.includes(e.method_id)})),y:u,edges:d}}var ee=function(){function e(t){if(Object(y.a)(this,e),void 0!==t){var n=t.get_map();this.map=new Map(n)}else this.map=new Map}return Object(_.a)(e,[{key:"add_function",value:function(e,t){for(var n=arguments.length,a=new Array(n>2?n-2:0),r=2;r<n;r++)a[r-2]=arguments[r];this.map.has(e)&&this.map.delete(e);var s=function(e,n){return t.apply(void 0,[e,n].concat(a))};this.map.set(e,s)}},{key:"get_function",value:function(e){if(this.map.has(e))return this.map.get(e)}},{key:"get_map",value:function(){return this.map}}]),e}(),te=n(20);function ne(e,t){var n,a,r=e.edges,s=e.x,i=e.y,o=H(r,(function(e){return e.get_x()}),(function(e){return e.get_y()}));return{x:(n=s,a=o,n.sort((function(e,t){var n=e.get_id(),r=t.get_id(),s=a.has(n)?a.get(n).size:0,i=a.has(r)?a.get(r).size:0;return s<i?1:s>i?-1:0}))),y:i,edges:r}}function ae(e,t){var n,a,r=e.edges,s=e.x,i=e.y,o=H(r,(function(e){return e.get_y()}),(function(e){return e.get_x()}));return{edges:r,x:s,y:(n=i,a=o,n.sort((function(e,t){var n=e.get_id(),r=t.get_id(),s=a.has(n)?a.get(n).size:0,i=a.has(r)?a.get(r).size:0;return s<i?1:s>i?-1:0})))}}function re(e,t){var n=e.edges,a=e.x,r=e.y;a.length>0&&(a[0].boo=Math.random());var s=H(t.edges,(function(e){return e.test_id}),(function(e){return e.method_id})),i=new Map,o=new Map;a.forEach((function(e){o.set(e.method_id,e)})),r.forEach((function(e,t,n){var a=e.test_id,r=s.get(a),c=new Set,l=new Set;r.forEach((function(e){var t=o.get(e);void 0!==t&&(c.add("".concat(t.package_name)),l.add("".concat(t.package_name,".").concat(t.class_name)))})),c.size>1?i.set(e.test_id,"S"):1===c.size&&l.size>1?i.set(e.test_id,"I"):1===l.size?i.set(e.test_id,"U"):i.set(e.test_id,"")}));var c,l=Object(te.a)(n);try{var u=function(){var e=c.value,t=i.get(e.test_id);e.test_type=t,e.get_color=function(){switch(e.test_type){case"S":return"#9033ff";case"I":return"#eb8c06";case"U":return"#02ae5e";default:return"black"}}};for(l.s();!(c=l.n()).done;)u()}catch(d){l.e(d)}finally{l.f()}return{edges:n,x:a,y:r}}function se(e,t){var n=e.edges,a=e.x,r=e.y;a.length>0&&(a[0].boo=Math.random());var s,i=Object(te.a)(n);try{var o=function(){var e=s.value;e.get_color=function(){switch(e.test_result){case"P":return"#03C03C";case"F":return"#FF1C00";default:return"black"}}};for(i.s();!(s=i.n()).done;)o()}catch(c){i.e(c)}finally{i.f()}return{edges:n,x:a,y:r}}function ie(e,t){var n=e.x,a=e.y,r=e.edges;return{x:n.sort((function(e,t){return e.get_cluster()<t.get_cluster()?1:e.get_cluster()>t.get_cluster()?-1:0})),y:a,edges:r}}function oe(e,t){var n=e.x,a=e.y,r=e.edges;return{x:n,y:a.sort((function(e,t){return e.get_cluster()<t.get_cluster()?1:e.get_cluster()>t.get_cluster()?-1:0})),edges:r}}function ce(e,t){var n=e.x,a=e.y,r=e.edges,s=new Map,i=H(t.edges,(function(e){return e.method_id}),(function(e){return e.test_id})),o=new Map;t.edges.forEach((function(e){var t=e.test_id,n="P"===e.test_result;o.set(t,n)}));var c=0,l=0;return o.forEach((function(e,t){e?l+=1:c+=1})),0!==c&&0!==l&&(t.x.forEach((function(e){s.set(e.get_id(),function(e){var t=0,n=0;return i.has(e.get_id())?(i.get(e.get_id()).forEach((function(e){o.has(e)&&o.get(e)?t+=1:n+=1})),n/c/(t/l+n/c)):-1}(e))})),n=n.sort((function(e,t){var n=s.get(e.get_id()),a=s.get(t.get_id());return n<a?1:n>a?-1:0}))),{edges:r,x:n,y:a}}var le=function(e){Object(x.a)(n,e);var t=Object(k.a)(n);function n(e){var a;return Object(y.a)(this,n),(a=t.call(this)).state={selectedProject:"",data:{x:[],y:[],edges:[]},history:[new ee],projects:[],commits:[],expanded:!1,reset:!1,isVisible:!1,currentMethod:"",anchor:null,current_method_id:"",coloring:""},a.backInTime=a.backInTime.bind(Object(b.a)(a)),a.reset=a.reset.bind(Object(b.a)(a)),a.onProjectChange=a.onProjectChange.bind(Object(b.a)(a)),a.updateReset=a.updateReset.bind(Object(b.a)(a)),a.setMethodAnchor=a.setMethodAnchor.bind(Object(b.a)(a)),a}return Object(_.a)(n,[{key:"onProjectChange",value:function(){var e=Object(v.a)(g.a.mark((function e(t){var n,a=this;return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:n=t.target.value,w(n).then((function(e){a.setState({data:{x:e.methods,y:e.tests,edges:e.edges},history:[new ee]})})).catch((function(e){return console.error(e)}));case 2:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()},{key:"componentDidMount",value:function(){var e=Object(v.a)(g.a.mark((function e(){var t,n,a;return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,[{key:0,value:"commons-cli-experiment-9722ec17bf9dbd1deab299bdd6dfe038fedae3bd"},{key:1,value:"jpacman-framework-2434427914fa957f65617a9e794510f0c6ada9f9"},{key:2,value:"commons-io-29b70e156f9241b0c3e25896c931d1ef8725ad66"},{key:3,value:"jsoup-89580cc3d25d0d89ac1f46b349e5cd315883dc79"},{key:4,value:"maven-7a4b77b582913aad0ee941df8e86a5b83bc3eec8"}];case 2:return t=e.sent,n=t[0].value,e.next=6,w(n);case 6:a=e.sent,this.setState({selectedProject:t[0].value,projects:t,data:{x:a.methods,y:a.tests,edges:a.edges},history:[new ee]});case 8:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"backInTime",value:function(){if(!(this.state.history.length<=1)){var e=this.state.history.slice(0,this.state.history.length-1);this.setState({history:e})}}},{key:"reset",value:function(){this.setState({history:[new ee]}),this.setState({selectedProject:"",selectedCommit:"",reset:!0})}},{key:"updateReset",value:function(){this.setState({reset:!1})}},{key:"setMethodAnchor",value:function(){this.setState({anchor:null})}},{key:"render",value:function(){var e=this,t=this.state.history,n=t[t.length-1],a=function(e,t){var n={x:Object(R.cloneDeep)(e.x),y:Object(R.cloneDeep)(e.y),edges:Object(R.cloneDeep)(e.edges)};return t.get_map().forEach((function(t,a){n=t(n,e)})),n}(this.state.data,n),s=t.length>1,i=function(t){return function(n,a){var r=!!a&&t;e.setState({expanded:r})}};return r.a.createElement(r.a.Fragment,null,r.a.createElement("div",{className:"test-visualization"},(a.x.length>=0||a.y.length>=0)&&r.a.createElement(D,{x:a.x,y:a.y,edges:a.edges,onMethodClick:function(t,a){var r=new ee(n);r.add_function("filter_by_coexecuted_methods",$,a.to_string()),e.setState({history:e.state.history.concat(r)})},onTestClick:function(t,a){var r=new ee(n);r.add_function("filter_by_coexecuted_tests",W,a.to_string()),e.setState({history:e.state.history.concat(r)})},onRightClick:function(t,n){t.preventDefault(),e.setState({isVisible:!0,currentMethod:n.to_string(),anchor:t.target,current_method_id:n.get_id()})},labelToggle:s,xlabel:"methods",ylabel:"test cases"}),r.a.createElement("div",{id:"toolbox"},r.a.createElement("h4",null,"Toolbar"),r.a.createElement(j.a,{expanded:"panel1"===this.state.expanded,onChange:i("panel1")},r.a.createElement(O.a,{expandIcon:r.a.createElement(T.a,null),"aria-controls":"panel1a-content",id:"data-set-selector"},r.a.createElement("span",null,"Project Selection")),r.a.createElement(S.a,{className:"accordion-block"},r.a.createElement(q,{title:"Projects",onChange:this.onProjectChange,entries:this.state.projects,reset:this.state.reset,updateReset:this.updateReset}))),r.a.createElement(j.a,{expanded:"panel2"===this.state.expanded,onChange:i("panel2")},r.a.createElement(O.a,{expandIcon:r.a.createElement(T.a,null),"aria-controls":"panel1a-content",id:"data-set-selector"},r.a.createElement("span",null,"Sorting")),r.a.createElement(S.a,{className:"accordion-block"},r.a.createElement(q,{title:"Sort X-Axis",onChange:function(t){var a=new ee(n),r=function(e){return e};switch(t.target.value){case"Coverage":r=ne;break;case"Cluster":r=ie;break;case"Suspiciousness":r=ce}a.add_function("sorting-x",r),e.setState({history:e.state.history.concat(a)})},entries:[{key:0,value:"Name"},{key:1,value:"Coverage"},{key:2,value:"Cluster"},{key:3,value:"Suspiciousness"}],reset:this.state.reset,updateReset:this.updateReset}),r.a.createElement(q,{title:"Sort Y-Axis",onChange:function(t){var a=new ee(n),r=function(e){return e};switch(t.target.value){case"Coverage":r=ae;break;case"Cluster":r=oe}a.add_function("sorting-y",r),e.setState({history:e.state.history.concat(a)})},entries:[{key:0,value:"Name"},{key:1,value:"Coverage"},{key:2,value:"Cluster"}],reset:this.state.reset,updateReset:this.updateReset}))),r.a.createElement(j.a,{expanded:"panel3"===this.state.expanded,onChange:i("panel3")},r.a.createElement(O.a,{expandIcon:r.a.createElement(T.a,null),"aria-controls":"panel1a-content",id:"data-set-selector"},r.a.createElement("span",null,"Test Filters")),r.a.createElement(S.a,{className:"accordion-block"},r.a.createElement(q,{title:"Test Type",entries:[{key:0,value:"All"},{key:X.UNIT,value:X.UNIT},{key:X.INTEGRATION,value:X.INTEGRATION},{key:X.SYSTEM,value:X.SYSTEM}],description:["Filter based on type of test:","- All: Present all tests.","- Unit: Only tests that cover methods within a single class.","- Integration: Only tests that cover methods across multiple classes in a single packages.","- System: Only tests that cover methods across multiple packages."],onChange:function(t){var a=t.target.value,r=new ee(n);r.add_function("filter_by_test_type",K,a),r.add_function("filter_method_by_number_of_times_tested",Z,1),e.setState({history:e.state.history.concat(r)})},reset:this.state.reset,updateReset:this.updateReset}),r.a.createElement(q,{title:"Test Pass Filter",entries:[{key:0,value:"All"},{key:1,value:Q.PASS},{key:2,value:Q.FAIL}],description:["Filter based on the result of each test case:","- All: Present all test cases regardless on passed or failed","- Only Pass: Present only passed test cases","- Only Fail: Present only failed test cases"],onChange:function(t,a){var r=t.target.value,s=new ee(n);s.add_function("filter_by_test_passed",J,r),s.add_function("filter_method_by_number_of_times_tested",Z,1),e.setState({history:e.state.history.concat(s)})},reset:this.state.reset,updateReset:this.updateReset}),r.a.createElement(L,{title:"Search Test:",entries:a.y,onClick:function(t){var a=t.target.value,r=new ee(n);r.add_function("filter_by_coexecuted_tests",W,a),r.add_function("filter_method_by_number_of_times_tested",Z,1),e.setState({history:e.state.history.concat(r)})}}))),r.a.createElement(j.a,{expanded:"panel4"===this.state.expanded,onChange:i("panel4")},r.a.createElement(O.a,{expandIcon:r.a.createElement(T.a,null),"aria-controls":"panel1a-content",id:"data-set-selector"},r.a.createElement("span",null,"Method Filters")),r.a.createElement(S.a,{className:"accordion-block"},r.a.createElement(L,{title:"Search Method:",entries:a.x,onClick:function(t){var a=t.target.value,r=new ee(n);r.add_function("filter_by_coexecuted_methods",$,a),r.add_function("filter_method_by_number_of_times_tested",Z,1),e.setState({history:e.state.history.concat(r)})}}))),r.a.createElement(j.a,{expanded:"panel5"===this.state.expanded,onChange:i("panel5")},r.a.createElement(O.a,{expandIcon:r.a.createElement(T.a,null),"aria-controls":"panel1a-content",id:"data-set-selector"},r.a.createElement("span",null,"Color Schemes")),r.a.createElement(S.a,{className:"accordion-block"},r.a.createElement(q,{title:"Pick a Color Scheme:",entries:[{key:0,value:"Pass/Fail"},{key:1,value:"Unit/Integration/System"}],onChange:function(t,a){var r=new ee(n),s=function(e){return e};switch(t.target.value){case"Unit/Integration/System":s=re;break;case"Pass/Fail":s=se;break;default:console.log("".concat(t.target.value," not yet supported"))}r.add_function("color-nodes",s),e.setState({history:e.state.history.concat(r)})},reset:this.state.reset,updateReset:this.updateReset}))),r.a.createElement(B,{title:"Methods",entries:a.x}),r.a.createElement(B,{title:"Tests",entries:a.y}),r.a.createElement("div",{id:"control-tools"},r.a.createElement("button",{onClick:this.backInTime},"Back"),r.a.createElement("button",{onClick:this.reset},"Reset")))))}}]),n}(a.Component),ue=(n(253),function(e){Object(x.a)(n,e);var t=Object(k.a)(n);function n(){return Object(y.a)(this,n),t.apply(this,arguments)}return Object(_.a)(n,[{key:"render",value:function(){return r.a.createElement("div",{className:"footer"},r.a.createElement("div",null,r.a.createElement("a",{href:"http://spideruci.org"},r.a.createElement("img",{alt:"spideruci.org",src:"spider_circle_red.svg"}))),r.a.createElement("div",null,r.a.createElement("a",{href:"https://github.com/spideruci"},r.a.createElement("img",{alt:"github.com/spideruci",src:"./GitHub-Mark-32px.png"}))))}}]),n}(r.a.Component)),de=(n(254),n(255),function(e){return r.a.createElement("div",{className:"header"},r.a.createElement("h1",null,e.title))}),he=function(){return r.a.createElement("nav",null,r.a.createElement(o.c,{to:"/"},r.a.createElement(de,{title:"Morpheus"})),r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement(o.c,{to:"/about"},"About")),r.a.createElement("li",null,r.a.createElement(o.c,{to:"/visualization"},"Visualization"))))};n(257);var fe=function(){return r.a.createElement("div",{className:"app"},r.a.createElement(o.a,{basename:"/morpheus"},r.a.createElement(he,null),r.a.createElement("div",{className:"component"},r.a.createElement(c.c,null,r.a.createElement(c.a,{exact:!0,path:"/",component:le}),r.a.createElement(c.a,{path:"/about",component:m}),r.a.createElement(c.a,{path:"/visualization",component:le})))),r.a.createElement(ue,null))};n(258);i.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(o.b,null,r.a.createElement(fe,null))),document.getElementById("root"))}},[[142,1,2]]]);
//# sourceMappingURL=main.8b632e99.chunk.js.map