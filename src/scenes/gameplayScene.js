var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;
  var n_ticks;

  var hoverer;
  var keyer;
  var cam;
  var shakecam;
  var shake;
  var mouse;
  var mouselistener;
  var space;
  var shadow;
  var man;
  var grid;
  var lazer;

  var enemies;

  var mouse_detects;

  var mouse_hit;
  var mouse_hit_tl;
  var mouse_hit_tr;
  var mouse_hit_bl;
  var mouse_hit_br;
  var input_wasd;
  var input_w;
  var input_a;
  var input_s;
  var input_d;
  var input_shift;
  var input_space;

  self.ready = function()
  {
    n_ticks = 0;
    hoverer = new PersistentHoverer({source:stage.dispCanv.canvas});
    keyer = new Keyer({source:stage.dispCanv.canvas});

    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#000000";

    cam = new obj();
    cam.wx = 0;
    cam.wy = 0;
    cam.ww = 2;
    cam.wh = 1;
    shakecam = new obj();
    shakecam.wx = 0;
    shakecam.wy = 0;
    shakecam.ww = 2;
    shakecam.wh = 1;
    shake =
    {
      x:0,
      y:0,
      vx:0,
      vy:0,
      to_x:0,
      to_y:0,
      amt:0,
    }

    mouselistener = new obj();
    mouselistener.x = 0;
    mouselistener.y = 0;
    mouselistener.w = canv.width;
    mouselistener.h = canv.height;
    mouse = new obj();
    mouse.x = 0;
    mouse.y = 0;
    mouse.w = 1;
    mouse.h = 1;
    mouselistener.hover = function(evt)
    {
      mouse_hit = true;
      mouse.x = evt.doX-0.5;
      mouse.y = evt.doY-0.5;
    }
    mouselistener.unhover = function(evt){}
    hoverer.register(mouselistener)

    mouse_detects = [];
    for(var i = 0; i < 4; i++)
    {
      var m = new obj();
      m.w = 85;
      m.h = 30;
      switch(i)
      {
        case 0:
          m.x = 20;
          m.y = 20;
          m.hover = function(evt) { if(!mouse_hit_tl) shakeshake(.1); mouse_hit_tl = true; }
          break;
        case 1:
          m.x = canv.width-m.w-20;
          m.y = 20;
          m.hover = function(evt) { if(!mouse_hit_tr) shakeshake(.1); mouse_hit_tr = true; }
          break;
        case 2:
          m.x = 20;
          m.y = canv.height-m.h-20;
          m.hover = function(evt) { if(!mouse_hit_bl) shakeshake(.1); mouse_hit_bl = true; }
          break;
        case 3:
          m.x = canv.width-m.w-20;
          m.y = canv.height-m.h-20;
          m.hover = function(evt) { if(!mouse_hit_br) shakeshake(.1); mouse_hit_br = true; }
          break;
      }
      m.unhover = function(evt) {}
      hoverer.register(m);
      mouse_detects[i] = m;
    }

    space = new obj();
    space.x = 0;
    space.y = 0;
    space.w = spaceBar.width;
    space.h = spaceBar.height;
    space.charge = 0;

    man = new phys();
    man.wx = 0;
    man.wy = 0;
    man.ww = 0.1;
    man.wh = 0.2;
    man.up = false;
    man.down = false;
    man.left = false;
    man.right = false;
    man.shift = false;
    man.space = false;
    man.key = function(k){}
    man.key_letter = function(k){}
    man.key_down = function(k)
    {
      switch(k.keyCode)
      {
        case 16: man.shift = true; input_shift = true; break;
        case 87: man.up    = true; input_wasd = true; input_w = true; break;
        case 65: man.left  = true; input_wasd = true; input_a = true; break;
        case 83: man.down  = true; input_wasd = true; input_s = true; break;
        case 68: man.right = true; input_wasd = true; input_d = true; break;
        case 32: man.space = true; input_space = true; break;
      }
    }
    man.key_up = function(k)
    {
      switch(k.keyCode)
      {
        case 16: man.shift = false; break;
        case 87: man.up    = false; break;
        case 65: man.left  = false; break;
        case 83: man.down  = false; break;
        case 68: man.right = false; break;
        case 32: break; //do nothing
      }
    }
    keyer.register(man);
    shadow = new obj();
    shadow.ww = man.ww;
    shadow.wh = man.wh;

    lazer = new Lazer();
    lazer.w = 100;
    lazer.h = 200;

    enemies = [];

    grid = new Grid();
    grid.wx = 0;
    grid.wy = 0;
    grid.ww = 1;
    grid.wh = 1;

    mouse_hit = false;
    mouse_hit_tl = false;
    mouse_hit_tr = false;
    mouse_hit_bl = false;
    mouse_hit_br = false;
    input_wasd = false;
    input_w = false;
    input_a = false;
    input_s = false;
    input_d = false;
    input_shift = false;
    input_space = false;
  };

  self.tick = function()
  {
    n_ticks++;
    hoverer.flush();
    keyer.flush();

    if(man.up)    applyAcc(man,0,0.001);
    if(man.down)  applyAcc(man,0,-0.001);
    if(man.left)  applyAcc(man,-0.001,0);
    if(man.right) applyAcc(man,0.001,0);
    tickPhys(man);

    cam.wx = lerp(cam.wx,man.wx,0.05);
    cam.wy = lerp(cam.wy,man.wy,0.05);

    tickshake();
    compositeShake();
    worldSpace(shakecam,canv,mouse);

    space.x = lerp(space.x,mouse.x+mouse.w/2-space.w/2,0.1);
    space.y = lerp(space.y,mouse.y-20-space.h,0.1);
    space.charge+=0.1; if(space.charge > 1) space.charge = 1;

    if(man.space)
    {
      shadow.wx = man.wx;
      shadow.wy = man.wy;
      man.vwx = (mouse.wx-man.wx)/20;
      man.vwy = (mouse.wy-man.wy)/20;
      man.wx = mouse.wx;
      man.wy = mouse.wy;
    }

    if(man.shift) chargeLazer();
    else          dischargeLazer();

    //'in game'
    if(input_shift || (input_w && input_a && input_s && input_d && mouse_hit_tl && mouse_hit_tr && mouse_hit_bl && mouse_hit_br))
    {
      if(n_ticks % 200 == 0)
        enemies.push(genEnemy());
    }
    tickEnemies();
  };

  self.draw = function()
  {
    screenSpace(shakecam,canv,grid);
    grid.draw();

    screenSpace(shakecam,canv,man);
    ctx.fillRect(man.x,man.y,man.w,man.h);
    if(man.space)
    {
      screenSpace(shakecam,canv,shadow);
      ctx.beginPath();
      ctx.moveTo(shadow.x,shadow.y);
      ctx.lineTo(shadow.x,shadow.y+shadow.h);
      ctx.lineTo(man.x,man.y+man.h);
      ctx.lineTo(man.x,man.y);
      ctx.closePath();
      ctx.beginPath();
      ctx.moveTo(shadow.x+shadow.w,shadow.y);
      ctx.lineTo(shadow.x+shadow.w,shadow.y+shadow.h);
      ctx.lineTo(man.x+man.w,man.y+man.h);
      ctx.lineTo(man.x+man.w,man.y);
      ctx.closePath();
      ctx.fill();
      man.space = false;
    }
    positionLazerToMan();
    drawLazer();

    if(mouse_hit)
    {
      drawMouse();
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(man.x+man.w/2,man.y+man.h/2);
      ctx.lineTo(mouse.x+mouse.w/2,mouse.y+mouse.h/2);
      ctx.stroke();
      ctx.lineWidth = 2;
    }

    if(!mouse_hit_tl) ctx.drawImage(mouseHit,mouse_detects[0].x,mouse_detects[0].y,mouse_detects[0].w,mouse_detects[0].h);
    if(!mouse_hit_tr) ctx.drawImage(mouseHit,mouse_detects[1].x,mouse_detects[1].y,mouse_detects[1].w,mouse_detects[1].h);
    if(!mouse_hit_bl) ctx.drawImage(mouseHit,mouse_detects[2].x,mouse_detects[2].y,mouse_detects[2].w,mouse_detects[2].h);
    if(!mouse_hit_br) ctx.drawImage(mouseHit,mouse_detects[3].x,mouse_detects[3].y,mouse_detects[3].w,mouse_detects[3].h);

    ctx.font = "Bold 250px Arial";
    ctx.textAlign = "center";
    if(man.shift)
    {
    }
    else
    {
      if(input_w && input_a && input_s && input_d && mouse_hit_tl && mouse_hit_tr && mouse_hit_bl && mouse_hit_br && n_ticks % 100 < 50)
      {
        ctx.fillText ("SHIFT",canv.width/2,canv.height+10);
      }
    }

    if(!input_w) ctx.fillText ("W",canv.width/2,canv.height/2+40);
    if(!input_a) ctx.fillText ("A",canv.width/2-100,canv.height/2+140);
    if(!input_s) ctx.fillText ("S",canv.width/2,canv.height/2+140);
    if(!input_d) ctx.fillText ("D",canv.width/2+100,canv.height/2+140);

    drawEnemies();
  };

  self.cleanup = function()
  {
  };

  var shakeshake = function(s)
  {
    shake.amt += s;
    var theta = Math.random()*Math.PI*2;
    shake.to_x = Math.cos(theta)*shake.amt;
    shake.to_y = Math.sin(theta)*shake.amt;
  }
  var tickshake = function()
  {
    if(shake.amt > 0.001 && (shake.to_x-shake.x)/shake.vx < 0) //don't bother reshaking if so close to 0
    {
      shake.amt *= 0.8;
      shakeshake(0);
    }
    shake.vx += (shake.to_x-shake.x)/2;
    shake.vy += (shake.to_y-shake.y)/2;
    shake.vx *= 0.9;
    shake.vy *= 0.9;
    shake.x += shake.vx;
    shake.y += shake.vy;
  }
  var compositeShake = function()
  {
    shakecam.wx = cam.wx+shake.x;
    shakecam.wy = cam.wy+shake.y;
  }
  var positionLazerToMan = function()
  {
    if(man.x > lazer.w+10) lazer.to_x = man.x-lazer.w-5;
    else                   lazer.to_x = man.x+man.w+5;
    lazer.to_y = man.y-lazer.h/4;
    if(lazer.to_y < 5)
      lazer.to_y = 5;
    if(lazer.to_y > canv.height-lazer.h-5)
      lazer.to_y = canv.height-lazer.h-5;

    lazer.ax = (lazer.to_x-lazer.x)/100;
    lazer.ay = (lazer.to_y-lazer.y)/100;
    lazer.vx += lazer.ax;
    lazer.vy += lazer.ay;
    lazer.x += lazer.vx;
    lazer.y += lazer.vy;
    lazer.vx *= 0.9;
    lazer.vy *= 0.9;
  }
  var drawCharge = function(line,p,x,y,w,h)
  {
    switch(line)
    {
      case 10:
      case 9:
      case 8:
      case 7:
      case 6:
      case 5:
      case 4:
      case 3:
      case 2:
      case 1:
        ctx.fillRect(x,y,w*p,h);
        break;
      case 0:
        var pad = 2;
        var rw = ((w+pad)/10)-pad;
        for(var i = 0; i < p*10; i++)
          ctx.drawImage(roundedRect,x+(rw+pad)*i,y,rw,h);
        break;
    }
  }
  var drawMouse = function()
  {
    ctx.drawImage(spaceBar,space.x,space.y,space.w,space.h);
    ctx.beginPath();
    ctx.moveTo(mouse.x-10,mouse.y);
    ctx.lineTo(mouse.x-4,mouse.y);
    ctx.moveTo(mouse.x+10,mouse.y);
    ctx.lineTo(mouse.x+4,mouse.y);
    ctx.moveTo(mouse.x,mouse.y-10);
    ctx.lineTo(mouse.x,mouse.y-4);
    ctx.moveTo(mouse.x,mouse.y+10);
    ctx.lineTo(mouse.x,mouse.y+4);
    ctx.stroke();
  }
  var drawLazer = function()
  {
    ctx.textAlign = "left";
    ctx.font = "Bold 20px Arial";
    //ctx.fillText("CHARGE:",lazer.x,lazer.y);
    ctx.strokeRect(lazer.x,lazer.y,lazer.w,lazer.h);
    var p = 2;
    var bh = ((lazer.h-10)+p)/10;

    //draw all previous charges
    switch(lazer.level)
    {
      case 10: drawCharge(9,1,lazer.x+5,lazer.y+5+(9*(bh+p)),lazer.w-10,bh); console.log("SHIIIIIIIIIIT");
      case 9:  drawCharge(8,1,lazer.x+5,lazer.y+5+(8*(bh+p)),lazer.w-10,bh);
      case 8:  drawCharge(7,1,lazer.x+5,lazer.y+5+(7*(bh+p)),lazer.w-10,bh);
      case 7:  drawCharge(6,1,lazer.x+5,lazer.y+5+(6*(bh+p)),lazer.w-10,bh);
      case 6:  drawCharge(5,1,lazer.x+5,lazer.y+5+(5*(bh+p)),lazer.w-10,bh);
      case 5:  drawCharge(4,1,lazer.x+5,lazer.y+5+(4*(bh+p)),lazer.w-10,bh);
      case 4:  drawCharge(3,1,lazer.x+5,lazer.y+5+(3*(bh+p)),lazer.w-10,bh);
      case 3:  drawCharge(2,1,lazer.x+5,lazer.y+5+(2*(bh+p)),lazer.w-10,bh);
      case 2:  drawCharge(1,1,lazer.x+5,lazer.y+5+(1*(bh+p)),lazer.w-10,bh);
      case 1:  drawCharge(0,1,lazer.x+5,lazer.y+5+(0*(bh+p)),lazer.w-10,bh);
      case 0: 
    }
    //draw current charge
    switch(lazer.level)
    {
      case 10: console.log("SHIIIIIIIIIIT");
      case 9:  drawCharge(9,lazer.charges[lazer.level]/lazer.caps[lazer.level],lazer.x+5,lazer.y+5+(9*(bh+p)),lazer.w-10,bh); break;
      case 8:  drawCharge(8,lazer.charges[lazer.level]/lazer.caps[lazer.level],lazer.x+5,lazer.y+5+(8*(bh+p)),lazer.w-10,bh); break;
      case 7:  drawCharge(7,lazer.charges[lazer.level]/lazer.caps[lazer.level],lazer.x+5,lazer.y+5+(7*(bh+p)),lazer.w-10,bh); break;
      case 6:  drawCharge(6,lazer.charges[lazer.level]/lazer.caps[lazer.level],lazer.x+5,lazer.y+5+(6*(bh+p)),lazer.w-10,bh); break;
      case 5:  drawCharge(5,lazer.charges[lazer.level]/lazer.caps[lazer.level],lazer.x+5,lazer.y+5+(5*(bh+p)),lazer.w-10,bh); break;
      case 4:  drawCharge(4,lazer.charges[lazer.level]/lazer.caps[lazer.level],lazer.x+5,lazer.y+5+(4*(bh+p)),lazer.w-10,bh); break;
      case 3:  drawCharge(3,lazer.charges[lazer.level]/lazer.caps[lazer.level],lazer.x+5,lazer.y+5+(3*(bh+p)),lazer.w-10,bh); break;
      case 2:  drawCharge(2,lazer.charges[lazer.level]/lazer.caps[lazer.level],lazer.x+5,lazer.y+5+(2*(bh+p)),lazer.w-10,bh); break;
      case 1:  drawCharge(1,lazer.charges[lazer.level]/lazer.caps[lazer.level],lazer.x+5,lazer.y+5+(1*(bh+p)),lazer.w-10,bh); break;
      case 0:  drawCharge(0,lazer.charges[lazer.level]/lazer.caps[lazer.level],lazer.x+5,lazer.y+5+(0*(bh+p)),lazer.w-10,bh); break;
    }
  }
  var chargeLazer = function()
  {
    lazer.charges[lazer.level]++;
    if(lazer.charges[lazer.level] >= lazer.caps[lazer.level])
      lazer.level++;
    if(lazer.level >= lazer.charges.length)
      console.log("SHIIIIIIIIT");
  }
  var dischargeLazer = function()
  {
    if(lazer.level >= lazer.charges.length)
      console.log("SHIIIIIIIIT");
    else
    {
      lazer.charges[lazer.level] -= 10*(lazer.level+1);
      if(lazer.charges[lazer.level] <= 0)
      {
        if(lazer.level != 0)
        {
          lazer.charges[lazer.level-1] += lazer.charges[lazer.level];
          lazer.charges[lazer.level] = 0;
          lazer.level--;
        }
        else lazer.charges[lazer.level] = 0;
      }
    }
  }

  var genEnemy = function()
  {
    var e = new phys();
    e.ww = 0.1;
    e.wh = 0.1;
    var theta = Math.random()*Math.PI*2;
    e.wx = Math.cos(theta)*2;
    e.wy = Math.sin(theta)*2;
    return e;
  }

  var drawEnemies = function()
  {
    for(var i = 0; i < enemies.length; i++)
    {
      screenSpace(shakecam,canv,enemies[i]);
      ctx.fillRect(enemies[i].x,enemies[i].y,enemies[i].w,enemies[i].h);
    }
  }

  var tickEnemies = function()
  {
    var e;
    for(var i = 0; i < enemies.length; i++)
    {
      e = enemies[i];
      e.vwx += (man.wx-e.wx)/200;
      e.vwy += (man.wy-e.wy)/200;
      e.vwx *= 0.9;
      e.vwy *= 0.9;
      e.wx += e.vwx;
      e.wy += e.vwy;
    }
  }

  var obj = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;
    self.wx = 0;
    self.wy = 0;
    self.ww = 0;
    self.wh = 0;
  }

  var phys = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;
    self.wx = 0;
    self.wy = 0;
    self.ww = 0;
    self.wh = 0;
    self.vwx = 0;
    self.vwy = 0;
    self.awx = 0;
    self.awy = 0;
  }
  var tickPhys = function(phys)
  {
    phys.vwx += phys.awx;
    phys.vwy += phys.awy;
    phys.wx  += phys.vwx;
    phys.wy  += phys.vwy;

    phys.vwx *= 0.95;
    phys.vwy *= 0.95;
  }
  var applyAcc = function(phys,ax,ay)
  {
    phys.vwx += ax;
    phys.vwy += ay;
  }
  var clearAcc = function(phys)
  {
    phys.awx = 0;
    phys.awy = 0;
  }

  var Lazer = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.to_x = 0;
    self.to_y = 0;

    self.vx = 0;
    self.vy = 0;
    self.ax = 0;
    self.ay = 0;

    self.level = 0;
    self.charges = [0,0,0,0,0,0,0,0,0,0];
    self.caps = [100,200,500,1000,1500,3000,10000,20000,50000,100000];
  }
  var Grid = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;
    self.wx = 0;
    self.wy = 0;
    self.ww = 0;
    self.wh = 0;
    self.draw = function()
    {
      ctx.beginPath();
      var cx;
      for(var c = 0; c < 10; c++)
      {
        cx = lerp(self.x,self.x+self.w,c/9);
        ctx.moveTo(cx,self.y);
        ctx.lineTo(cx,self.y+self.h);
      }
      for(var r = 0; r < 10; r++)
      {
        ry = lerp(self.y,self.y+self.h,r/9);
        ctx.moveTo(self.x,ry);
        ctx.lineTo(self.x+self.w,ry);
      }
      ctx.stroke();
    }
  }

  var roundedRect = GenIcon(20,20);
  var r = 6;
  roundedRect.context.fillRect(r,0,roundedRect.width-(2*r),roundedRect.height);
  roundedRect.context.fillRect(0,r,roundedRect.width,roundedRect.height-(2*r));
  roundedRect.context.beginPath();
  roundedRect.context.arc(                  r,                   r,r,0,Math.PI*2);
  roundedRect.context.arc(roundedRect.width-r,                   r,r,0,Math.PI*2);
  roundedRect.context.arc(                  r,roundedRect.height-r,r,0,Math.PI*2);
  roundedRect.context.arc(roundedRect.width-r,roundedRect.height-r,r,0,Math.PI*2);
  roundedRect.context.fill();

  var mouseHit = GenIcon(85,30);
  var r = 8;
  mouseHit.context.fillRect(r,0,mouseHit.width-(2*r),mouseHit.height);
  mouseHit.context.fillRect(0,r,mouseHit.width,mouseHit.height-(2*r));
  mouseHit.context.beginPath();
  mouseHit.context.arc(               r,                r,r,0,Math.PI*2);
  mouseHit.context.arc(mouseHit.width-r,                r,r,0,Math.PI*2);
  mouseHit.context.arc(               r,mouseHit.height-r,r,0,Math.PI*2);
  mouseHit.context.arc(mouseHit.width-r,mouseHit.height-r,r,0,Math.PI*2);
  mouseHit.context.fill();
  mouseHit.context.fillStyle = "#FFFFFF";
  mouseHit.context.font = "Bold 20px Arial";
  mouseHit.context.textAlign = "center";
  mouseHit.context.fillText("MOUSE",mouseHit.width/2,mouseHit.height/2+10-2);

  var spaceBar = GenIcon(95,40);
  var r = 8;
  var s = 3;
  spaceBar.context.translate(0,1); //wtf canvas? it's weirdly duplicating the bottom row of pixels...
  spaceBar.context.fillStyle = "#000000";
  spaceBar.context.fillRect(r,0,spaceBar.width-(2*r),spaceBar.height);
  spaceBar.context.fillRect(0,r,spaceBar.width,spaceBar.height-(2*r));
  spaceBar.context.beginPath();
  spaceBar.context.arc(               r,                r,r,0,Math.PI*2);
  spaceBar.context.arc(spaceBar.width-r,                r,r,0,Math.PI*2);
  spaceBar.context.arc(               r,spaceBar.height-r,r,0,Math.PI*2);
  spaceBar.context.arc(spaceBar.width-r,spaceBar.height-r,r,0,Math.PI*2);
  spaceBar.context.fill();
  spaceBar.context.fillStyle = "#FFFFFF";
  spaceBar.context.fillRect(r+s,0+s,spaceBar.width-(2*r)-(2*s),spaceBar.height      -(2*s));
  spaceBar.context.fillRect(0+s,r+s,spaceBar.width      -(2*s),spaceBar.height-(2*r)-(2*s));
  spaceBar.context.beginPath();
  spaceBar.context.arc(               r+s,                r+s,r,0,Math.PI*2);
  spaceBar.context.arc(spaceBar.width-r-s,                r+s,r,0,Math.PI*2);
  spaceBar.context.arc(               r+s,spaceBar.height-r-s,r,0,Math.PI*2);
  spaceBar.context.arc(spaceBar.width-r-s,spaceBar.height-r-s,r,0,Math.PI*2);
  spaceBar.context.fill();
  spaceBar.context.fillStyle = "#000000";
  spaceBar.context.font = "Bold 20px Arial";
  spaceBar.context.textAlign = "center";
  spaceBar.context.fillText("SPACE",spaceBar.width/2,spaceBar.height/2+10-2);
};

