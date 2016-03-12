var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var hoverer;
  var keyer;
  var cam;
  var mouse;
  var man;
  var grid;
  var lazer;

  self.ready = function()
  {
    hoverer = new PersistentHoverer({source:stage.dispCanv.canvas});
    keyer = new Keyer({source:stage.dispCanv.canvas});

    cam = new obj();
    cam.wx = 0;
    cam.wy = 0;
    cam.ww = 2;
    cam.wh = 1;

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
      mouse.x = evt.doX-0.5;
      mouse.y = evt.doy-0.5;
    }
    mouselistener.unhover = function(evt){}
    hoverer.register(mouselistener)

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
    man.key = function(k){}
    man.key_letter = function(k){}
    man.key_down = function(k)
    {
      switch(k.keyCode)
      {
        case 16: man.shift = true; break;
        case 87: man.up    = true; break;
        case 65: man.left  = true; break;
        case 83: man.down  = true; break;
        case 68: man.right = true; break;
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
      }
    }
    keyer.register(man);

    grid = new Grid();
    grid.wx = 0;
    grid.wy = 0;
    grid.ww = 1;
    grid.wh = 1;
  };

  self.tick = function()
  {
    hoverer.flush();
    keyer.flush();

    if(man.up)    applyAcc(man,0,0.001);
    if(man.down)  applyAcc(man,0,-0.001);
    if(man.left)  applyAcc(man,-0.001,0);
    if(man.right) applyAcc(man,0.001,0);
    tickPhys(man);

    cam.wx = lerp(cam.wx,man.wx,0.05);
    cam.wy = lerp(cam.wy,man.wy,0.05);

    worldSpace(cam,canv,mouse);
  };

  self.draw = function()
  {
    screenSpace(cam,canv,grid);
    grid.draw();

    screenSpace(cam,canv,man);
    ctx.fillStyle = "#000000";
    ctx.fillRect(man.x,man.y,man.w,man.h);
  };

  self.cleanup = function()
  {
  };

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
};

