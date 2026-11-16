import * as THREE from "three";
const $=id=>document.getElementById(id);
const S={gender:"male",name:"Player",outfit:"#236da5",coins:0,rank:1,shards:0,cam:3,driving:false,vehicle:null,keys:{},paused:false,day:0};
let scene,camera,renderer,clock,player,playerRoot,vehicles=[],shards=[],sun,ambient,buildings=[];
const mat=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const M={asphalt:mat(0x252d35),sidewalk:mat(0x858b8b),grass:mat(0x426247),gold:mat(0xf4c56a,.25,.45),skin:mat(0xc58b69),pants:mat(0x29394d),rubber:mat(0x17191d),glass:new THREE.MeshPhysicalMaterial({color:0x8bb9ca,roughness:.16,metalness:.15,transparent:true,opacity:.78}),white:mat(0xe7e4da)};
function mesh(geo,ma,p,parent=scene){let o=new THREE.Mesh(geo,ma);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(w,h,d,ma,x,y,z,parent=scene){return mesh(new THREE.BoxGeometry(w,h,d),ma,[x,y,z],parent)}
function cyl(rt,rb,h,ma,x,y,z,parent=scene){return mesh(new THREE.CylinderGeometry(rt,rb,h,16),ma,[x,y,z],parent)}
function capsule(rad,len,ma,x,y,z,parent){return mesh(new THREE.CapsuleGeometry(rad,len,5,10),ma,[x,y,z],parent)}
function say(t){$("notice").textContent=t;$("notice").classList.add("on");clearTimeout(say.timer);say.timer=setTimeout(()=>$("notice").classList.remove("on"),2100)}
function makeTexture(base,detail){const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");x.fillStyle=base;x.fillRect(0,0,256,256);for(let i=0;i<1700;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.07})`;x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1+Math.random()*3)}if(detail){x.strokeStyle="rgba(0,0,0,.12)";for(let i=0;i<256;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i,256);x.stroke()}}let t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);return t}
function setup(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x9bb7c7);scene.fog=new THREE.Fog(0x9bb7c7,90,260);
 camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,600);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;$("game").appendChild(renderer.domElement);
 clock=new THREE.Clock();ambient=new THREE.HemisphereLight(0xe5f2ff,0x354536,1.65);scene.add(ambient);sun=new THREE.DirectionalLight(0xffe2bd,2.7);sun.position.set(-55,90,45);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-110,right:110,top:110,bottom:-110});scene.add(sun);
 const ground=mesh(new THREE.PlaneGeometry(420,420),new THREE.MeshStandardMaterial({color:0x6b8062,roughness:1,map:makeTexture("#697f60",false)}),[0,-.15,0]);ground.rotation.x=-Math.PI/2;
 city();makePlayer();makeCars();makeShards();props();
}
function city(){
 // asphalt road grid and pavements
 for(let i=-3;i<=3;i++){let a=i*32;box(13,.12,220,M.asphalt,a,0,0);box(220,.12,13,M.asphalt,0,0,a);box(17,.2,220,M.sidewalk,a>0?a-8.2:a+8.2,.02,0);box(220,.2,17,M.sidewalk,0,.02,a>0?a-8.2:a+8.2);
  for(let n=-6;n<=6;n++){box(.18,.025,3,M.white,a,.08,n*16);box(3,.025,.18,M.white,n*16,.08,a)}
 }
 const facades=[0x9d9a8b,0x7c8990,0xc0b6a4,0x687e83,0xa5a18f,0x7d8796,0x9a816c];
 for(let gx=-3;gx<=3;gx++)for(let gz=-3;gz<=3;gz++){if(Math.abs(gx)===3&&Math.abs(gz)===3)continue;let cx=gx*32,cz=gz*32;
  for(let b=0;b<4;b++){let x=cx+(b%2?9:-9),z=cz+(b<2?9:-9),w=8+Math.random()*3,d=8+Math.random()*3,h=10+Math.random()*26;
   let base=facades[Math.floor(Math.random()*facades.length)],wallmat=mat(base,.9);let body=box(w,h,d,wallmat,x,h/2,z);buildings.push(body);
   box(w+.25,.4,d+.25,mat(0x39434a),x,h+.2,z);
   // recessed-looking window rows
   let win=mat(0x8ab5c2,.22,.25);win.emissive=new THREE.Color(0x142b35);let rows=Math.floor((h-3)/3);
   for(let r=0;r<rows;r++)for(let col=0;col<Math.floor(w/2);col++){let wx=x-w/2+1.2+col*2.1,wy=2.2+r*3;box(.95,1.25,.08,win,wx,wy,z+d/2+.05);box(.95,1.25,.08,win,wx,wy,z-d/2-.05)}
   // shop awnings on street-level buildings
   if(Math.random()>.55){box(w*.8,.22,1.2,mat([0x9e4f43,0x456b83,0xb18a4f][Math.floor(Math.random()*3)]),x,2.8,z+d/2+.65);for(let k=0;k<3;k++)box(.55,1.6,.1,mat(0x243b46),x-w*.25+k*w*.25,1.1,z+d/2+.08)}
  }
 }
 // central public plaza and water
 box(27,.25,27,mat(0xb9b5a8),0,.12,0);cyl(5.2,5.2,.55,mat(0x647e86),0,.5,0);cyl(4,4,.22,mat(0x4da4ad,.2,.3),0,.88,0);
 let fountain=cyl(.55,.7,1.4,mat(0xb5c2c3,.2,.4),0,1.55,0);let water=mesh(new THREE.CylinderGeometry(3.8,3.8,.12,40),new THREE.MeshPhysicalMaterial({color:0x5fc6d0,roughness:.12,metalness:.25}),[0,1.04,0]);
 // park zone
 box(26,.12,24,mat(0x52794d),-65,.02,-65);
 for(let i=0;i<22;i++){let x=-76+Math.random()*22,z=-76+Math.random()*22;tree(x,z)}
 // coastal promenade at far edge
 box(220,.3,24,mat(0xb9b2a1),0,.08,-104);box(420,.2,80,mat(0x2f7891),0,-.22,-160);
 for(let i=0;i<30;i++){let x=-95+Math.random()*190;tree(x,-96+Math.random()*8)}
}
function tree(x,z){cyl(.3,.45,2.4,mat(0x76553a),x,1.2,z);let crown=mesh(new THREE.IcosahedronGeometry(1.7,1),mat(0x3d7447),[x,3,z]);crown.scale.set(1,1.25,1)}
function makePlayer(){
 playerRoot=new THREE.Group();scene.add(playerRoot);let clothes=mat(S.outfit,.7),skin=mat(S.gender==="female"?0xc88c70:0xb77b5c),hair=mat(S.gender==="female"?0x241a19:0x201b19),pants=M.pants;
 // rounded stylized human silhouette with jointed limbs
 capsule(.39,.58,clothes,0,1.45,0,playerRoot);mesh(new THREE.SphereGeometry(.3,20,16),skin,[0,2.12,0],playerRoot);
 let haircap=mesh(new THREE.SphereGeometry(.315,20,12,0,Math.PI*2,0,Math.PI*.65),hair,[0,2.2,0],playerRoot);
 capsule(.105,.62,clothes,-.48,1.48,0,playerRoot);capsule(.105,.62,clothes,.48,1.48,0,playerRoot);
 capsule(.13,.65,pants,-.19,.62,0,playerRoot);capsule(.13,.65,pants,.19,.62,0,playerRoot);
 box(.25,.14,.42,mat(0x24282d),-.19,.18,.07,playerRoot);box(.25,.14,.42,mat(0x24282d),.19,.18,.07,playerRoot);
 // face details
 for(let x of [-.105,.105])mesh(new THREE.SphereGeometry(.035,8,8),mat(0x201c1a),[x,2.13,.27],playerRoot);
 playerRoot.position.set(0,0,18);player=playerRoot;
}
function makeCars(){
 let colors=[0x9c2527,0x1b5c91,0xb59b54,0x313b48,0x48775f,0xeeeeea];
 for(let i=0;i<6;i++){let g=new THREE.Group();scene.add(g);let bodymat=mat(colors[i],.28,.55);
  // rounded body volumes
  mesh(new THREE.BoxGeometry(2.25,.62,4.35),bodymat,[0,.78,0],g);
  mesh(new THREE.BoxGeometry(1.72,.78,2.15),M.glass,[0,1.38,-.2],g);
  box(2.12,.18,1.2,mat(0x20252b),0,.48,1.55,g);
  for(let x of [-1.12,1.12])for(let z of [-1.35,1.35]){let wh=cyl(.4,.4,.24,M.rubber,x,.42,z,g);wh.rotation.z=Math.PI/2;let hub=cyl(.19,.19,.25,mat(0x9da6aa,.3,.7),x,.42,z,g);hub.rotation.z=Math.PI/2}
  for(let x of [-.78,.78]){box(.32,.13,.08,mat(0xf6e3b0),x,.82,2.18,g);box(.34,.13,.08,mat(0xa52a2b),x,.82,-2.18,g)}
  g.position.set(i%2?16:-16,0,-28+i*18);g.rotation.y=i%2?Math.PI/2:0;g.userData.speed=0;vehicles.push(g)
 }
}
function makeShards(){for(let i=0;i<22;i++){let g=new THREE.Group();let gem=mesh(new THREE.OctahedronGeometry(.7,1),new THREE.MeshPhysicalMaterial({color:0xffd16c,emissive:0x885000,metalness:.55,roughness:.18}),[0,0,0],g);let halo=mesh(new THREE.TorusGeometry(.9,.035,8,28),mat(0xffd889,.2,.6),[0,0,0],g);halo.rotation.x=Math.PI/2;g.position.set((Math.random()-.5)*165,1.6,(Math.random()-.5)*165);g.userData.base=1.6;scene.add(g);shards.push(g)}}
function props(){for(let x=-90;x<=90;x+=30)for(let z=-90;z<=70;z+=30){if(Math.abs(x%32)<9||Math.abs(z%32)<9)continue;cyl(.09,.12,5.5,mat(0x343e47),x,2.75,z);box(1.1,.14,.25,mat(0x343e47),x+.45,5.4,z);let bulb=mesh(new THREE.SphereGeometry(.18,8,8),new THREE.MeshBasicMaterial({color:0xffe4a8}),[x+.8,5.25,z]);}}
function nearestCar(){let found=null,d=5;for(let v of vehicles){let n=v.position.distanceTo(player.position);if(n<d){found=v;d=n}}return found}
function use(){if(S.driving){let v=S.vehicle;S.driving=false;v.userData.speed=0;player.position.copy(v.position);player.position.x+=3;S.vehicle=null;say("خرجت من السيارة");return}let v=nearestCar();if(v){S.driving=true;S.vehicle=v;say("أنت تقود السيارة");}else say("اقترب أكثر من إحدى السيارات")}
function save(){if(!player)return;localStorage.setItem("wod-ultimate",JSON.stringify({name:S.name,gender:S.gender,outfit:S.outfit,coins:S.coins,rank:S.rank,shards:S.shards,x:player.position.x,z:player.position.z}));say("تم حفظ تقدمك")}
function silentSave(){if(player)localStorage.setItem("wod-ultimate",JSON.stringify({name:S.name,gender:S.gender,outfit:S.outfit,coins:S.coins,rank:S.rank,shards:S.shards,x:player.position.x,z:player.position.z}))}
function hud(){ $("money").textContent=S.coins;$("rank").textContent=S.rank;$("taskcount").textContent=Math.min(S.shards,5)+" / 5";$("meterfill").style.width=Math.min(S.shards/5*100,100)+"%";$("task").textContent=S.shards>=5?"اكتملت المهمة! استكشف المدينة واجمع المزيد.":"اجمع 5 شظايا ضوئية منتشرة في المدينة"}
function start(load=false){S.name=$("playerName").value.trim()||"Player";S.outfit=$("outfit").value;S.gender=document.querySelector(".gender .selected").dataset.gender;if(load){let d;try{d=JSON.parse(localStorage.getItem("wod-ultimate"))}catch{}if(d){Object.assign(S,d);$("playerName").value=S.name;$("outfit").value=S.outfit;}}
 setup();if(load){player.position.set(S.x||0,0,S.z||18)}$("start").classList.add("hidden");$("hud").classList.remove("hidden");$("loading").style.display="none";S.started=true;hud();say("أهلاً بك في عالم الأحلام");loop()}
function pause(){S.paused=true;$("pause").classList.remove("hidden")}function resume(){S.paused=false;$("pause").classList.add("hidden");$("helpbox").classList.add("hidden")}
function cameraMode(){S.cam=S.cam===3?1:3;say(S.cam===1?"منظور الشخص الأول":"منظور الشخص الثالث")}
function timeMode(){S.day=(S.day+1)%3;let cols=[0x9bb7c7,0xd88a68,0x111d36],int=[2.7,1.3,.4];scene.background.setHex(cols[S.day]);scene.fog.color.setHex(cols[S.day]);sun.intensity=int[S.day];ambient.intensity=S.day===2?.45:1.5;say(["نهار","غروب","ليل"][S.day])}
function move(dt){let f=S.keys.w||S.keys.arrowup,b=S.keys.s||S.keys.arrowdown,l=S.keys.a||S.keys.arrowleft,r=S.keys.d||S.keys.arrowright;if(S.driving){let v=S.vehicle,acc=(f?1:0)-(b?1:0);v.userData.speed=THREE.MathUtils.damp(v.userData.speed,acc*23,2.1,dt);v.rotation.y+=((l?1:0)-(r?1:0))*dt*1.65*(Math.abs(v.userData.speed)/10+.25);v.position.x+=Math.sin(v.rotation.y)*v.userData.speed*dt;v.position.z+=Math.cos(v.rotation.y)*v.userData.speed*dt;player.position.copy(v.position);return}
 let dx=(r?1:0)-(l?1:0),dz=(b?1:0)-(f?1:0),dir=new THREE.Vector3(dx,0,dz);if(dir.length()){dir.normalize();player.position.addScaledVector(dir,(S.keys.shift?10:6)*dt);player.rotation.y=Math.atan2(dir.x,dir.z)}
 player.position.x=THREE.MathUtils.clamp(player.position.x,-105,105);player.position.z=THREE.MathUtils.clamp(player.position.z,-180,100);
 if(S.keys[" "]&&player.position.y<=.02)player.userData.vy=7.5;player.userData.vy=(player.userData.vy||0)-18*dt;player.position.y=Math.max(0,player.position.y+(player.userData.vy||0)*dt);if(!player.position.y)player.userData.vy=0;
}
function camUpdate(dt){let p=S.driving?S.vehicle:player;if(S.cam===1){camera.position.set(p.position.x,p.position.y+2,p.position.z);camera.rotation.set(0,p.rotation.y,0);camera.rotation.order="YXZ";return}let dist=8;let wanted=p.position.clone().add(new THREE.Vector3(Math.sin(p.rotation.y)*dist,4.5,Math.cos(p.rotation.y)*dist));camera.position.lerp(wanted,Math.min(1,dt*5));camera.lookAt(p.position.x,p.position.y+1.2,p.position.z)}
function collect(dt){for(let c of shards){if(!c.visible)continue;c.rotation.y+=dt*1.5;c.position.y=c.userData.base+Math.sin(performance.now()*.002+c.position.x)*.22;if(c.position.distanceTo(player.position)<2){c.visible=false;S.coins+=15;S.shards++;if(S.shards%5===0)S.rank++;hud();say("+15 عملة • حصلت على شظية");silentSave()}}}
function drawMap(){let c=$("mapcanvas"),x=c.getContext("2d"),w=c.width;x.clearRect(0,0,w,w);x.fillStyle="#18313a";x.fillRect(0,0,w,w);x.save();x.translate(w/2,w/2);x.scale(.8,.8);x.strokeStyle="#718087";x.lineWidth=7;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(i*32,-180);x.lineTo(i*32,180);x.stroke();x.beginPath();x.moveTo(-180,i*32);x.lineTo(180,i*32);x.stroke()}for(let s of shards)if(s.visible){x.fillStyle="#f7c66c";x.beginPath();x.arc(s.position.x,s.position.z,3,0,7);x.fill()}x.fillStyle="#5ec9ff";x.beginPath();x.arc(player.position.x,player.position.z,6,0,7);x.fill();x.restore()}
let saveTick=0;function loop(){if(!S.started)return;requestAnimationFrame(loop);let dt=Math.min(clock.getDelta(),.04);if(!S.paused){move(dt);camUpdate(dt);collect(dt);drawMap();if(performance.now()-saveTick>25000){saveTick=performance.now();silentSave()}}renderer.render(scene,camera)}
document.querySelectorAll("[data-gender]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-gender]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
$("play").onclick=()=>start(false);$("continue").onclick=()=>start(true);$("menu").onclick=pause;$("resume").onclick=resume;$("save").onclick=save;$("home").onclick=()=>{silentSave();location.reload()};$("help").onclick=()=>{$("pause").classList.add("hidden");$("helpbox").classList.remove("hidden")};$("back").onclick=()=>{$("helpbox").classList.add("hidden");$("pause").classList.remove("hidden")};$("cam").onclick=cameraMode;$("clock").onclick=timeMode;$("maptoggle").onclick=()=>$("map").classList.toggle("hidden");
addEventListener("keydown",e=>{let k=e.key.toLowerCase();S.keys[k]=true;if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k))e.preventDefault();if(k==="e"&&S.started&&!S.paused)use();if(k==="c")cameraMode();if(k==="n"&&scene)timeMode();if(k==="m")$("map").classList.toggle("hidden");if(k==="escape"&&S.started){S.paused?resume():pause()}});addEventListener("keyup",e=>S.keys[e.key.toLowerCase()]=false);addEventListener("blur",()=>S.keys={});
document.querySelectorAll("[data-move]").forEach(b=>{let k=b.dataset.move;b.onpointerdown=e=>{e.preventDefault();S.keys[k]=true};["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,()=>S.keys[k]=false))});
document.querySelectorAll("[data-act]").forEach(b=>b.onpointerdown=e=>{e.preventDefault();let a=b.dataset.act;if(a==="jump")S.keys[" "]=true;if(a==="use")use();if(a==="cam")cameraMode()});addEventListener("pointerup",()=>S.keys[" "]=false);
addEventListener("resize",()=>{if(renderer){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}});
$("loading").style.display="none";if(!localStorage.getItem("wod-ultimate"))$("continue").style.display="none";
