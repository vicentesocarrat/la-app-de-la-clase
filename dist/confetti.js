/* Confeti con geometría 3D, proyección en perspectiva y luz direccional. */
window.launchConfetti=function(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return ()=>{};
 const canvas=document.createElement('canvas');canvas.className='confetti-canvas';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return ()=>{};}
 let w=innerWidth,h=innerHeight,frame,finished=false;const dpr=Math.min(devicePixelRatio||1,2);
 function resize(){w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
 resize();window.addEventListener('resize',resize);
 const rand=(a,b)=>a+Math.random()*(b-a),particles=[];
 const total=w<600?120:170;
 for(let i=0;i<total;i++){
  const burst=i<total*.55,side=i%2?1:-1,ribbon=i%6===0;
  particles.push({x:burst?(side<0?-25:w+25):rand(-50,w+50),y:burst?h*rand(.65,.9):rand(-h*.45,-35),z:rand(-500,100),vx:burst?-side*rand(150,380):rand(-30,30),vy:burst?rand(-700,-420):rand(65,140),vz:rand(-25,30),rx:rand(0,6.28),ry:rand(0,6.28),rz:rand(0,6.28),sx:rand(-5,5),sy:rand(-4,4),sz:rand(-3,3),phase:rand(0,6.28),width:rand(8,15),length:ribbon?rand(32,55):rand(12,23),ribbon,color:i%7===0?'pearl':i%3===0?'yellow':'gold',delay:burst?rand(0,.45):rand(0,2.1)});
 }
 function rotate(v,p){let [x,y,z]=v;let c=Math.cos(p.rx),s=Math.sin(p.rx);[y,z]=[y*c-z*s,y*s+z*c];c=Math.cos(p.ry);s=Math.sin(p.ry);[x,z]=[x*c+z*s,-x*s+z*c];c=Math.cos(p.rz);s=Math.sin(p.rz);return [x*c-y*s,x*s+y*c,z];}
 function project(v,p){const z=p.z+v[2],scale=800/(800-z);return [(p.x-w/2+v[0])*scale+w/2,(p.y-h/2+v[1])*scale+h/2];}
 function paint(p,t){
  const segments=p.ribbon?5:1;
  for(let j=0;j<segments;j++){
   const a=j/segments,b=(j+1)/segments;
   const bend=u=>p.ribbon?Math.sin(u*4+t*2+p.phase)*5:0;
   const vertices=[[-p.width/2,(a-.5)*p.length,bend(a)],[p.width/2,(a-.5)*p.length,bend(a)],[p.width/2,(b-.5)*p.length,bend(b)],[-p.width/2,(b-.5)*p.length,bend(b)]].map(v=>rotate(v,p));
   const u=vertices[1].map((v,k)=>v-vertices[0][k]),v=vertices[3].map((v,k)=>v-vertices[0][k]);
   let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const norm=Math.hypot(...n)||1;n=n.map(x=>x/norm);if(n[2]<0)n=n.map(x=>-x);
   const light=Math.max(0,n[0]*-.4+n[1]*-.5+n[2]*.76),glint=Math.pow(light,16),lit=32+light*30+glint*25;
   ctx.fillStyle=p.color==='pearl'?`hsl(45 30% ${55+light*40}%)`:p.color==='yellow'?`hsl(56 100% ${32+light*25+glint*22}%)`:`hsl(43 ${75+glint*20}% ${lit}%)`;
   ctx.globalAlpha=Math.min(1,(t-p.delay)*5)*Math.min(1,(11-t)*1.5);
   const points=vertices.map(v=>project(v,p));ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
   ctx.strokeStyle=`rgba(255,247,202,${.2+light*.45})`;ctx.lineWidth=.6;ctx.stroke();
  }
 }
 const start=performance.now();let previous=start;
 function cleanup(){if(finished)return;finished=true;cancelAnimationFrame(frame);canvas.remove();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',pause);}
 function pause(){if(document.hidden)cleanup();}document.addEventListener('visibilitychange',pause);
 function draw(now){if(finished)return;const t=(now-start)/1000,dt=Math.min((now-previous)/1000,.04);previous=now;if(t>=11){cleanup();return;}ctx.clearRect(0,0,w,h);
  for(const p of particles){if(t<p.delay)continue;const age=t-p.delay;p.vx*=Math.exp(-dt*.3);p.vy=Math.min(145+(p.z+500)*.1,p.vy+260*dt);p.x+=(p.vx+Math.sin(age*2+p.phase)*24)*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.rx+=p.sx*dt;p.ry+=p.sy*dt;p.rz+=(p.sz+Math.sin(age+p.phase)*.5)*dt;}
  particles.sort((a,b)=>a.z-b.z);for(const p of particles){if(t>=p.delay&&p.y<h+150)paint(p,t);}ctx.globalAlpha=1;frame=requestAnimationFrame(draw);
 }
 frame=requestAnimationFrame(draw);return cleanup;
};
