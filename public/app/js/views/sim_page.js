var ExtWindow=[];
var ExtShade=[];
var leftShade=[];
var rightShade=[];
var wallcount=4;

window.app.views.SimPage = Backbone.View.extend({

  el: "#view",

  template: JST["app/templates/sim.us"],

  MONTH_LENGTHS: [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ],
  QVALUES: {1: 18, 2: 21, 3: 23, 4: 25, 5: 29},
	camera: null,
  scene: null,
  renderer: null,
  controls: null,
  transform: null,
  solarCube: null,
  /*
  materials: [
    //new THREE.MeshLambertMaterial({ color: 0x000000 }), //Outer Floor Color
    ///new THREE.MeshLambertMaterial({ color: 0x666666 }), //Outer Roof Ceiling Color
    //new THREE.MeshLambertMaterial({ color: 0xcccccc, opacity: 0.1, depthWrite: false, depthTest: false, vertexColors: THREE.VertexColors }),
    //new THREE.MeshLambertMaterial({ color: 0xcccccc, wireframe: true }), //WireFrame or Wall color
    //new THREE.MeshLambertMaterial({ color: 0xe0ffff, opacity: 0.8, depthWrite: false, depthTest: false, vertexColors: THREE.NoColors }) //Window Color etc
  ],
  */

  events: {
    'resize window' : 'handleWindowResize',
    'click #run-button' : 'runSimulation',
    'change .group-disable' : 'handleSliderCheckboxChange',
    'click #left-panel-toggle' : 'toggleInputPanel',
    'change #bio-pcm' : 'handleBioPCMChange',
    'change #continent' : 'handleContinentChange',
    'change #country' : 'handleCountryChange'
  },

  // Create a transform matrix that will put the center of a zone at the origin (0, 0, 0)
  buildOriginTransform: function(zone) {
    var dimensions = { x: {}, y: {}, z: {} };
    _.each(zone, function(surface) {
      if (surface.BuildingSurface) {
        _.each(surface.BuildingSurface.vertices, function(vertex) {
          if (dimensions.x.min === undefined || vertex.x < dimensions.x.min) { dimensions.x.min = vertex.x; }
          if (dimensions.x.max === undefined || vertex.x > dimensions.x.max) { dimensions.x.max = vertex.x; }
          if (dimensions.y.min === undefined || vertex.y < dimensions.y.min) { dimensions.y.min = vertex.y; }
          if (dimensions.y.max === undefined || vertex.y > dimensions.y.max) { dimensions.y.max = vertex.y; }
          if (dimensions.z.min === undefined || vertex.z < dimensions.z.min) { dimensions.z.min = vertex.z; }
          if (dimensions.z.max === undefined || vertex.z > dimensions.z.max) { dimensions.z.max = vertex.z; }
        });
      }
    });

    return new THREE.Matrix4().makeTranslation(-dimensions.x.min-(dimensions.x.max-dimensions.x.min)/2,
      -dimensions.y.min-(dimensions.y.max-dimensions.y.min)/2,
      -dimensions.z.min-(dimensions.z.max-dimensions.z.min)/2);
  },

  /*
  getMaterialIndex: function(surfaceType) {
    switch (surfaceType) {
      case 'Floor':
        return 0;
      case 'Ceiling':
        return 1;
      case 'Wall':
        return 2;
      case 'Window':
        return 3;
    }
    return -1;
  },

  createGeometry: function(surface, transform) {
    var geometry = new THREE.PlaneGeometry();
    geometry.vertices = [];
    _.each(surface.vertices, function(vertex) {
      var vector = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
      vector.applyMatrix4(transform);
      geometry.vertices.push(vector);
    });

    return geometry;
  },

  createFaces: function(surface) {
    var faces = [];
    var face = new THREE.Face3(0, 1, 2);
    face.materialIndex = this.getMaterialIndex(surface.type);
    faces.push(face);
    face = new THREE.Face3(2, 3, 0);
    face.materialIndex = this.getMaterialIndex(surface.type);
    faces.push(face);
    return faces;
  },

  addPlane: function(scene, surface, transform) {
    var geometry = this.createGeometry(surface, transform);
    geometry.faces = this.createFaces(surface);
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeCentroids();
    geometry.name = surface.name;
    geometry.type = surface.type;

    //var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, overdraw: 0.5 });
    //var plane = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(this.materials));
    //plane.castShadow=true;
    //scene.add(plane);

    var axes = new THREE.AxisHelper (20);
    scene.add(axes);
    var boxGeometry =new THREE.BoxGeometry(4, 3, 4);
    var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xf2d478});
    var solarCube = new THREE.Mesh(boxGeometry, cubeMaterial);
    solarCube.position.x=0;
    solarCube.position.y=0;
    solarCube.position.z=2;
    solarCube.castShadow=true;
    scene.add(solarCube);

    var groundPlaneGeometry = new THREE.PlaneGeometry (100, 100);
    var groundPlaneMaterial= new THREE.MeshLambertMaterial ({color: 0xcccccc});
    var groundPlane = new THREE.Mesh (groundPlaneGeometry, groundPlaneMaterial);
    groundPlane.position.x=0;
    groundPlane.position.y=0;
    groundPlane.position.z=-0;
    groundPlane.receiveShadow=true;
    scene.add(groundPlane);

    var sunLight= new THREE.DirectionalLight (0xffffff, 0.1);
    sunLight.position.set(45, 45, 100);
    sunLight.castShadow=true;
    sunLight.onlyShadow=false;
    scene.add(sunLight);

    //var ambilight = new THREE.AmbientLight( 0x404040 ); // soft white light
    //scene.add( ambilight );
  },

  addPlanes: function(scene, surfaces, transform) {
    var self = this;
    _.each(surfaces, function(surface) {
      if (surface.BuildingSurface) {
        self.addPlane(scene, surface.BuildingSurface, transform);
      } else if (surface.FenestrationSurface) {
        self.addPlane(scene, surface.FenestrationSurface, transform);
      }
    });
  },
  */

/*
Ext window sizer with a header until window gets too large
WindowHeaderSize depth set at .3 meters
This code needs to be hooked to slider for window percent 
window percent should not exceed 99%
Model Window as a thin box so it doesn't get lost in wall

windowheadersize=.3
Extper=double(Extpercent)/100
Extww=pow(Extper,0.5)*CDbl(EastWestLength)
Extwh=pow(Extper,0.5)*CDbl(BuildingHeight)
sy1=str((CDbl(EastWestLength)-Extww)/2)
sy2=str(((CDbl(EastWestLength)-Extww)/2)+Extww)
sz1=str(CDbl(BuildingHeight)-windowheadersize)
sz2=str(CDbl(BuildingHeight)-windowheadersize-Extwh)
*/


  initializeScene: function(scene, surfaces, transform) {
    var axes = new THREE.AxisHelper(2000);
    scene.add(axes);

    var scalingFactor = 100;

    var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
//    var cubeMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0xff0000});
   // var cubeMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5, color: 0xf2d478});0xf2d478
    var cubeMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 1, color: 0xf2d478});
		this.solarCube = new THREE.Mesh(boxGeometry, cubeMaterial);
    this.solarCube.castShadow = true;
    this.solarCube.receiveShadow = true;
    this.solarCube.scale.x = 5*scalingFactor;
    this.solarCube.scale.y = 5*scalingFactor;
    this.solarCube.scale.z = 2.1336*scalingFactor;
    this.solarCube.position.x = 0;
    this.solarCube.position.y = 0;
    this.solarCube.position.z = this.solarCube.scale.z/2;
    this.scene.add(this.solarCube);
  
    var Cgeometry = new THREE.CylinderGeometry( 3, 3, 2000, 4 );
    var Cmaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
    this.DIRcylinder = new THREE.Mesh( Cgeometry, Cmaterial );
    this.scene.add( this.DIRcylinder );

    var Cgeometry2 = new THREE.CylinderGeometry( 20, 0, 100, 4 );
    this.DIRcylinder2 = new THREE.Mesh( Cgeometry2, Cmaterial );
    this.DIRcylinder2.rotation.z = Math.PI;
    this.DIRcylinder2.position.y=1000;
    this.scene.add( this.DIRcylinder2 );

    var curve = new THREE.EllipseCurve( 0,0,1000,1000,0,2*Math.PI,false );
    var path = new THREE.Path( curve.getPoints( 50 ) );
    var circleGeometry = path.createPointsGeometry( 50 );
    var circleMaterial = new THREE.LineBasicMaterial( { color : 0x000000 } );
    this.circle = new THREE.Line( circleGeometry, circleMaterial );
    this.scene.add( this.circle );
/*
    var facadeGeometry = new THREE.BoxGeometry(1, 1, 1);
    var facadeMaterial = new THREE.MeshBasicMaterial({ color: 0xf2d478});
    this.sFacade = new THREE.Mesh(facadeGeometry, facadeMaterial);
    this.sFacade.receiveShadow = true;
    this.sFacade.castShadow = true;
		this.sFacade.scale.x = 5*scalingFactor;
    this.sFacade.scale.y = 3;
    this.sFacade.scale.z = 2.1336*scalingFactor;
    this.sFacade.position.x = 0;
    this.sFacade.position.y = -2-this.solarCube.scale.y/2;
    this.sFacade.position.z = this.solarCube.scale.z/2;
    this.scene.add(this.sFacade);

    facadeGeometry = new THREE.BoxGeometry(1, 1, 1);
    facadeMaterial = new THREE.MeshBasicMaterial({ color: 0xf2d478});
    this.sFacade = new THREE.Mesh(facadeGeometry, facadeMaterial);
    this.sFacade.receiveShadow = true;
    this.sFacade.castShadow = true;
		this.sFacade.scale.x = 5*scalingFactor;
    this.sFacade.scale.y = 3;
    this.sFacade.scale.z = 2.1336*scalingFactor;
    this.sFacade.position.x = 0;
    this.sFacade.position.y = 2+this.solarCube.scale.y/2;
    this.sFacade.position.z = this.solarCube.scale.z/2;
    this.scene.add(this.sFacade);

    facadeGeometry = new THREE.BoxGeometry(1, 1, 1);
    facadeMaterial = new THREE.MeshBasicMaterial({ color: 0xf2d478});
    this.sFacade = new THREE.Mesh(facadeGeometry, facadeMaterial);
    this.sFacade.receiveShadow = true;
    this.sFacade.castShadow = true;
		this.sFacade.scale.x = 3;
    this.sFacade.scale.y = 5*scalingFactor;
    this.sFacade.scale.z = 2.1336*scalingFactor;
    this.sFacade.position.x = 2+this.solarCube.scale.x/2;
    this.sFacade.position.y = 0;
    this.sFacade.position.z = this.solarCube.scale.z/2;
    this.scene.add(this.sFacade);

		facadeGeometry = new THREE.BoxGeometry(1, 1, 1);
    facadeMaterial = new THREE.MeshBasicMaterial({ color: 0xf2d478});
    this.sFacade = new THREE.Mesh(facadeGeometry, facadeMaterial);
    this.sFacade.receiveShadow = true;
    this.sFacade.castShadow = true;
		this.sFacade.scale.x = 3;
    this.sFacade.scale.y = 5*scalingFactor;
    this.sFacade.scale.z = 2.1336*scalingFactor;
    this.sFacade.position.x = -2-this.solarCube.scale.x/2;
    this.sFacade.position.y = 0;
    this.sFacade.position.z = this.solarCube.scale.z/2;
    this.scene.add(this.sFacade);

		var roofGeometry = new THREE.BoxGeometry(1, 1, 1);
    var roofMaterial = new THREE.MeshBasicMaterial({ color: 0xf2d478});
    this.sFacade = new THREE.Mesh(facadeGeometry, facadeMaterial);
    this.sFacade.receiveShadow = true;
    this.sFacade.castShadow = true;
		this.sFacade.scale.x = 3;
    this.sFacade.scale.y = 5*scalingFactor;
    this.sFacade.scale.z = 2.1336*scalingFactor;
    this.sFacade.position.x = -2-this.solarCube.scale.x/2;
    this.sFacade.position.y = 0;
    this.sFacade.position.z = this.solarCube.scale.z/2;
    this.scene.add(this.sFacade);
*/
/*
    var ExtWindowGeometry = new THREE.BoxGeometry(1, 1, 1);
    var ExtWindowMaterial = new THREE.MeshBasicMaterial({ color: 0x1011ff});
    ExtWindow[i] = new THREE.Mesh(ExtWindowGeometry, ExtWindowMaterial);
    ExtWindow[i].castShadow = false;
    ExtWindow[i].receiveShadow = true;
    var windowtowall= Math.sqrt(40/100);
    //var Swinowtowall = Math.sqrt(windowtowall);
    ExtWindow[i].scale.x = (windowtowall)*(this.solarCube.scale.x);
    ExtWindow[i].scale.z = (windowtowall)*(this.solarCube.scale.z);
    //ExtWindow[i].scale.x = 150;
    ExtWindow[i].scale.y = 2;
    //ExtWindow[i].scale.z = 200;
    ExtWindow[i].position.x = 0;
    ExtWindow[i].position.y = -4-this.solarCube.scale.y/2;
    ExtWindow[i].position.z = this.solarCube.scale.z/2;
    this.scene.add(ExtWindow[i]);
*/
    var windowtowall=Math.sqrt(40/100);
		var i;
		var ExtWindowGeometry;
		var ExtWindowMaterial;
    var ExtShadeGeometry;
    var ExtShadeMaterial;
		var leftShadeGeometry;
    var leftShadeMaterial;
		var rightShadeGeometry;
		var rightShadeMaterial;
	/*	
		var ExtWindow=[];
		var ExtShade=[];
		var leftShade=[];
		var rightShade=[];
*/
		for(i=0;i<wallcount;i++){
			ExtWindowGeometry = new THREE.BoxGeometry(1, 1, 1);
			ExtWindowMaterial = new THREE.MeshBasicMaterial({ color: 0x1011ff});
			ExtWindow[i] = new THREE.Mesh(ExtWindowGeometry, ExtWindowMaterial);
			ExtWindow[i].castShadow = false;
			ExtWindow[i].receiveShadow = true;
			
			ExtShadeGeometry = new THREE.BoxGeometry(1, 1, 1);
			ExtShadeMaterial = new THREE.MeshBasicMaterial({color: 0xd43d2d});
			ExtShade[i] = new THREE.Mesh(ExtShadeGeometry, ExtShadeMaterial);
			ExtShade[i].castShadow = true;
			ExtShade[i].receiveShadow = false;

			leftShadeGeometry = new THREE.BoxGeometry(1, 1, 1);
			leftShadeMaterial = new THREE.MeshBasicMaterial({color: 0xd43d2d});
   		leftShade[i] = new THREE.Mesh(leftShadeGeometry, leftShadeMaterial);    
			//leftShade[i].receiveShadow = true;
			
			rightShadeGeometry = new THREE.BoxGeometry(1, 1, 1);
			rightShadeMaterial = new THREE.MeshBasicMaterial({color: 0xd43d2d});
			rightShade[i] = new THREE.Mesh(rightShadeGeometry, rightShadeMaterial);
			//rightShade[i].receiveShadow = true;

			
			switch(i){
				case 0://North:
					ExtWindow[i].scale.x = (windowtowall)*(this.solarCube.scale.x);
					ExtWindow[i].scale.z = (windowtowall)*(this.solarCube.scale.z);
					ExtWindow[i].scale.y = 2;
					ExtWindow[i].position.x = 0;
					ExtWindow[i].position.y = 4+this.solarCube.scale.y/2;
					ExtWindow[i].position.z = this.solarCube.scale.z/2;
					
					ExtShade[i].scale.x = ExtWindow[i].scale.x;
					ExtShade[i].scale.y = 0.2*ExtWindow[i].scale.z;
					ExtShade[i].scale.z = 1;
					ExtShade[i].position.x = 0;
					ExtShade[i].position.y = this.solarCube.scale.y/2+(ExtShade[i].scale.y/2);
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;
					
					leftShade[i].scale.x = 1;
					leftShade[i].scale.y = 0.2*ExtWindow[i].scale.x;
					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.x = (ExtWindow[i].scale.x/2);
					leftShade[i].position.y = this.solarCube.scale.y/2+(leftShade[i].scale.y/2);
					leftShade[i].position.z = ExtWindow[i].position.z;
					leftShade[i].castShadow = true;
					leftShade[i].receiveShadow = true;

					rightShade[i].scale.x = 1;
					rightShade[i].scale.y = 0.2*ExtWindow[i].scale.x;
					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.x = -(ExtWindow[i].scale.x/2);
					rightShade[i].position.y = this.solarCube.scale.y/2+(rightShade[i].scale.y/2);
					rightShade[i].position.z = ExtWindow[i].position.z;
					rightShade[i].castShadow = true;
					rightShade[i].receiveShadow = true;

					break;
				case 1://South:
					ExtWindow[i].scale.x = (windowtowall)*(this.solarCube.scale.x);
					ExtWindow[i].scale.z = (windowtowall)*(this.solarCube.scale.z);
					ExtWindow[i].scale.y = 2;
					ExtWindow[i].position.x = 0;
					ExtWindow[i].position.y = -4-this.solarCube.scale.y/2;
					ExtWindow[i].position.z = this.solarCube.scale.z/2;
					
					ExtShade[i].scale.x = ExtWindow[i].scale.x;
					ExtShade[i].scale.y = 0.2*ExtWindow[i].scale.z;
					ExtShade[i].scale.z = 1;
					ExtShade[i].position.x = 0;
					ExtShade[i].position.y = -this.solarCube.scale.y/2-(ExtShade[i].scale.y/2);
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.x = 1;
					leftShade[i].scale.y = 0.2*ExtWindow[i].scale.x;
					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.x = -(ExtWindow[i].scale.x/2);
					leftShade[i].position.y = -this.solarCube.scale.y/2-(leftShade[i].scale.y/2);
					leftShade[i].position.z = ExtWindow[i].position.z;
					leftShade[i].castShadow = true;
					leftShade[i].receiveShadow = true;

					rightShade[i].scale.x = 1;
					rightShade[i].scale.y = 0.2*ExtWindow[i].scale.x;
					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.x = (ExtWindow[i].scale.x/2);
					rightShade[i].position.y = -this.solarCube.scale.y/2-(rightShade[i].scale.y/2);
					rightShade[i].position.z = ExtWindow[i].position.z;
					rightShade[i].castShadow = true;
					rightShade[i].receiveShadow = true;

					break;
				case 2://East:
					ExtWindow[i].scale.y = (windowtowall)*(this.solarCube.scale.y);
					ExtWindow[i].scale.z = (windowtowall)*(this.solarCube.scale.z);
					ExtWindow[i].scale.x = 2;
					ExtWindow[i].position.x = 4+this.solarCube.scale.x/2;
					ExtWindow[i].position.y = 0;
					ExtWindow[i].position.z = this.solarCube.scale.z/2;

					ExtShade[i].scale.x = 0.2*ExtWindow[i].scale.z;
					ExtShade[i].scale.y = ExtWindow[i].scale.y;
					ExtShade[i].scale.z = 1;
					ExtShade[i].position.x = this.solarCube.scale.x/2+(ExtShade[i].scale.x/2);
					ExtShade[i].position.y = 0;
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.x = 0.2*ExtWindow[i].scale.y;
					leftShade[i].scale.y = 1;
					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.x = this.solarCube.scale.x/2+(leftShade[i].scale.x/2);
					leftShade[i].position.y = -(ExtWindow[i].scale.y/2);
					leftShade[i].position.z = ExtWindow[i].position.z;
					leftShade[i].castShadow = true;
					leftShade[i].receiveShadow = true;

					rightShade[i].scale.x = 0.2*ExtWindow[i].scale.y;
					rightShade[i].scale.y = 1; 
					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.x = this.solarCube.scale.x/2+(rightShade[i].scale.x/2);
					rightShade[i].position.y = (ExtWindow[i].scale.y/2);
					rightShade[i].position.z = ExtWindow[i].position.z;
					rightShade[i].castShadow = true;
					rightShade[i].receiveShadow = true;

					break;
				case 3://West:
					ExtWindow[i].scale.y = (windowtowall)*(this.solarCube.scale.y);
					ExtWindow[i].scale.z = (windowtowall)*(this.solarCube.scale.z);
					ExtWindow[i].scale.x = 2;
					ExtWindow[i].position.x = -4-this.solarCube.scale.x/2;
					ExtWindow[i].position.y = 0;
					ExtWindow[i].position.z = this.solarCube.scale.z/2;
				
					ExtShade[i].scale.x = 0.2*ExtWindow[i].scale.z;
					ExtShade[i].scale.y = ExtWindow[i].scale.y;
					ExtShade[i].scale.z = 1;
					ExtShade[i].position.x = -this.solarCube.scale.x/2-(ExtShade[i].scale.x/2);
					ExtShade[i].position.y = 0;
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.x = 0.2*ExtWindow[i].scale.y;
					leftShade[i].scale.y = 1;
					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.x = -this.solarCube.scale.x/2-(leftShade[i].scale.x/2);
					leftShade[i].position.y = -(ExtWindow[i].scale.y/2);
					leftShade[i].position.z = ExtWindow[i].position.z;
					leftShade[i].castShadow = true;
					leftShade[i].receiveShadow = true;

					rightShade[i].scale.x = 0.2*ExtWindow[i].scale.y;
					rightShade[i].scale.y = 1; 
					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.x = -this.solarCube.scale.x/2-(rightShade[i].scale.x/2);
					rightShade[i].position.y = (ExtWindow[i].scale.y/2);
					rightShade[i].position.z = ExtWindow[i].position.z;
					rightShade[i].castShadow = true;
					rightShade[i].receiveShadow = true;

					break;
				default: break;
			}
			this.scene.add(ExtWindow[i]);
			this.scene.add(ExtShade[i]);
    	this.scene.add(leftShade[i]);
   		this.scene.add(rightShade[i]);
		}


/*
		function drawWindow(sx,sy,sz,px,py,pz){
			ExtWindow[i].scale.x = sx;
			ExtWindow[i].scale.y = sy;
			ExtWindow[i].scale.z = sz;
			ExtWindow[i].position.x = px/2;
			ExtWindow[i].position.y = py/2;
			ExtWindow[i].position.z = pz/2;
		//	this.scene.add(ExtWindow[i]);
			return ExtWindow[i];
		}
*/

  
    var groundPlaneGeometry = new THREE.PlaneGeometry (10000, 10000);
    var groundPlaneMaterial = new THREE.MeshBasicMaterial ({color: 0xcccccc});
    this.groundPlane = new THREE.Mesh(groundPlaneGeometry, groundPlaneMaterial);
		this.groundPlane.position.x = 0;
    this.groundPlane.position.y = 0;
    this.groundPlane.position.z = 0;
    this.groundPlane.receiveShadow = true;
    scene.add(this.groundPlane);

    var SunGeometry = new THREE.SphereGeometry( 50, 32, 32 );
    var SunMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    this.SunSphere = new THREE.Mesh( SunGeometry, SunMaterial );
    this.SunSphere.position.x=-0;
    this.SunSphere.position.y=-394.7;
    this.SunSphere.position.z=918.8;
    scene.add(this.SunSphere);
  
    this.sunLight = new THREE.DirectionalLight (0xffffff, 0.1);
    this.sunLight.castShadow = true;
    this.sunLight.onlyShadow = true;
    this.sunLight.position.x=-0.0;
    this.sunLight.position.y=3*-394.7;
    this.sunLight.position.z=3*918.8;
    scene.add(this.sunLight);
  },

	windowScale: function(sx,sy,sz,px,py,pz){
		var ExtWindow;
		ExtWindow.scale.x = sx;
		ExtWindow.scale.y = sy;
		ExtWindow.scale.z = sz;
		ExtWindow.position.x = px/2;
		ExtWindow.position.y = py/2;
		ExtWindow.position.z = pz/2;
		return ExtWindow;
	//	this.scene.add(ExtWindow[i]);
	},

  createCamera: function(canvas) {
    var camera = new THREE.PerspectiveCamera(60, canvas.innerWidth() / canvas.innerHeight(), 1, 10000);
    camera.position.x = 0;
    camera.position.y = -2000;
    camera.position.z = 200;
    //camera.lookAt(scene.position);
    return camera;
  },

  createCanvasControls: function(canvas) {
    var controls = new THREE.TrackballControls(this.camera, canvas[0]);
    controls.rotateSpeed = 0.1;
    controls.zoomSpeed = 0.5;
    controls.panSpeed = 0.7;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ];
    return controls;
    
  },

  createManualControls: function() {

    var self = this;

     //Detailed inputs, may use later 
   // $("#NWinGR").slider({ min: 1, max: 99, value: 40, disabled: true, slide: self.updateSliderDisplay });
   // $("#EWinGR").slider({ min: 1, max: 99, value: 40, disabled: true, slide: self.updateSliderDisplay });
   // $("#SWinGR").slider({ min: 1, max: 99, value: 40, disabled: true, slide: self.updateSliderDisplay });
   // $("#WWinGR").slider({ min: 1, max: 99, value: 40, disabled: true, slide: self.updateSliderDisplay });
   // $("#Rinsulation-level").slider({ min: 1, max: 10, value: 3, slide: self.updateSliderDisplay });
   // $("#Ninsulation-level").slider({ min: 1, max: 10, value: 2, slide: self.updateSliderDisplay });
   // $("#Einsulation-level").slider({ min: 1, max: 10, value: 2, slide: self.updateSliderDisplay });
   // $("#Sinsulation-level").slider({ min: 1, max: 10, value: 2, slide: self.updateSliderDisplay });
    //$("#Winsulation-level").slider({ min: 1, max: 10, value: 2, slide: self.updateSliderDisplay });
    //$("#people-rate").slider({ min: 0, max: 100, value: 18 });
    //$("#lighting-rate").slider({ min: 0, max: 30, value: 11 });
    //$("#equipment-rate").slider({ min: 0, max: 30, value: 11 });
   // $("#hotwater-rate").slider({ min: 0, max: 30, value: 11 });

    $("#Width").slider({ min: 3, max: 21.336, value: 4.572, slide: self.updateWidth });
    $("#Height").slider({ min: 2.1336, max: 8, value: 2.4511, slide: self.updateHeight });
    //$("#FloorHeight").slider({ min: 0, max: 100, value: 0, slide: self.updateHeight });
    //depth is not needed for facade model and so default to 15ft
    $("#Depth").slider({ min:3, max: 21.336, value: 4.572, slide: self.updateDepth });
   
    $("#infiltration-rate").slider({ min: 0.35, max: 10, value: 1, step: 0.1, slide: self.updateSliderDisplay });
    $("#orientation").slider({min: 0, max: 360, value: 180, step: 1, slide: self.updateOrientaionDisplay });
    
    
//could we remove the checkbox for window with an "if WinGR>1 then yes" statement? 
    $("#WinGR").slider({ min: 1, max: 99, value: 40, slide: self.handleGlazingRatioChange });
    $("#insulation-level").slider({ min: 0.1, max: 10, value: 3, slide: self.updateSliderDisplay });
    $("#roof-insulation-level").slider({ min: 0.1, max: 10, value: 3, slide: self.updateSliderDisplay });
    $("#Window_U_Value").slider({ min: 1.94, max: 5.8, value: 3.12, step: 0.1, slide: self.updateSliderDisplay });
    $("#Window_SHGC").slider({ min: 0.25, max: 1, value: 0.42, step: 0.1, slide: self.updateSliderDisplay });
    $("#WinOverhangR").slider({ min: 0.01, max: 0.9, value: 0.5, step: 0.01, slide: self.handleOverHang });
    $("#LWinFinR").slider({ min: 0.01, max: 0.4, value: 0.2, step: 0.01, slide: self.handleFinL });
    $("#RWinFinR").slider({ min: 0.01, max: 0.4, value: 0.2, step: 0.01, slide: self.handleFinR });

    $("#CoolingSP").slider({ min: 23, max: 30, value: 25, step: 1, slide: self.updateSliderDisplay });
    //SB must be higher than SP or error $("#CoolingSB").slider({ min: 23, max: 40, value: 27, slide: self.updateSliderDisplay })
    $("#HeatingSP").slider({ min: 18, max: 22, value: 21, step: 1, slide: self.updateSliderDisplay });
    //SB must be higher than SP or error $("#HeatingSB").slider({ min: 12, max: 20, value: 18, slide: self.updateSliderDisplay })
  
		$('#mvalue').slider({ min: 10, max: 100, step: 10, value: 50, slide: self.updateSliderDisplay });
    $('#rmvalue').slider({ min: 10, max: 100, step: 10, value: 50, slide: self.updateSliderDisplay });
		$('#qvalue').slider({ min: 1, max: 5, step: 1, value: 3, slide: self.updateQValueSliderDisplay });
		$('#rqvalue').slider({ min: 1, max: 5, step: 1, value: 3, slide: self.updateQValueSliderDisplay });

		$("#day-of-year-slider").slider({ min: 1, max: 365, step: 1, value: 150, slide: self.updateDayOfYearSliderDisplay });
    $("#hour-of-day-slider").slider({ min: 1, max: 24, step: 1, value: 12, slide: self.updateHourOfDaySliderDisplay });

    $("#run-button").button();

    this.updateDayOfYearSliderDisplay({ target: { id: 'day-of-year-slider' } }, { value: 150 });
    this.updateHourOfDaySliderDisplay({ target: { id: 'hour-of-day-slider' } }, { value: 12 });
    this.setSliderDisplayValue('#Width');
    this.setSliderDisplayValue('#Depth');
    this.setSliderDisplayValue('#Height');
    //this.setSliderDisplayValue('#FloorHeight');

    this.setSliderDisplayValue('#orientation');

    this.setSliderDisplayValue('#HeatingSP');
    this.setSliderDisplayValue('#CoolingSP');
    
    this.setSliderDisplayValue('#infiltration-rate');

    this.setSliderDisplayValue('#insulation-level');
    this.setSliderDisplayValue('#roof-insulation-level');
    this.setSliderDisplayValue('#WinGR');
    this.setSliderDisplayValue('#Window_U_Value');
    this.setSliderDisplayValue('#Window_SHGC');
    this.setSliderDisplayValue('#WinOverhangR');
    this.setSliderDisplayValue('#LWinFinR');
    this.setSliderDisplayValue('#RWinFinR');

    //this.setSliderDisplayValue('#mvalue', 50);
    this.setSliderDisplayValue('#mvalue');
    this.setSliderDisplayValue('#rmvalue');
    this.setSliderDisplayValue('#qvalue',23);
    this.setSliderDisplayValue('#rqvalue',23);

    //Detailed inputs, may use later 
    //this.setSliderDisplayValue('#minventilation-rate');
    //this.setSliderDisplayValue('#coolingventilation-rate');
    //$("#minventilation-rate").slider({ min: 0.35, max: 10, value: 1 });
   //$("#coolingventilation-rate").slider({ min: 0.35, max: 10, value: 1 });
    //$("#CoolingsCoP").slider({ min: 0.76, max: 8, value: 1, slide: self.updateSliderDisplay })
    //$("#HeatingsCoP").slider({ min: 0.76, max: 8, value: 1, slide: self.updateSliderDisplay })
    //this.setSliderDisplayValue('#HeatingsCoP');
    //this.setSliderDisplayValue('#CoolingsCoP');
    //this.setSliderDisplayValue('#WinSillH');
    //this.setSliderDisplayValue('#NWinGR');
   // this.setSliderDisplayValue('#EWinGR');
   // this.setSliderDisplayValue('#SWinGR');
   // this.setSliderDisplayValue('#WWinGR');
   // this.setSliderDisplayValue('#Rinsulation-level');
   // this.setSliderDisplayValue('#Ninsulation-level');
   // this.setSliderDisplayValue('#Einsulation-level');
   // this.setSliderDisplayValue('#Sinsulation-level');
   // this.setSliderDisplayValue('#Winsulation-level');
   // this.setSliderDisplayValue('#people-rate');
  //  this.setSliderDisplayValue('#lighting-rate');
  //  this.setSliderDisplayValue('#equipment-rate');
  //  this.setSliderDisplayValue('#hotwater-rate');
  },

  handleBioPCMChange: function(evt) {
    var checked = $('#bio-pcm').prop('checked');
    $('#mvalue').slider(checked ? "enable" : "disable");
    $('#qvalue').slider(checked ? "enable" : "disable");

    $('#rmvalue').slider(checked ? "enable" : "disable");
    $('#rqvalue').slider(checked ? "enable" : "disable");
	},

  handleGlazingRatioChange: function(evt, ui) {
    this.updateSliderDisplay(evt, ui);
    var enable = ui.value > 1;
    var windowtowall= Math.sqrt(ui.value/100);
    var i;
		
		for(i=0;i<wallcount;i++){
			switch(i){	
				case 0:
					ratioShade=ExtShade[i].scale.y/ExtWindow[i].scale.z;
					ratioFin=leftShade[i].scale.y/ExtWindow[i].scale.x;

					ExtWindow[i].scale.x = (windowtowall)*(this.solarCube.scale.x);
					ExtWindow[i].scale.z = (windowtowall)*(this.solarCube.scale.z);

					ExtShade[i].scale.x = ExtWindow[i].scale.x;
					ExtShade[i].scale.y= ratioShade*ExtWindow[i].scale.z;
					ExtShade[i].position.y = this.solarCube.scale.y/2+(ExtShade[i].scale.y/2);
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.y = ratioFin*ExtWindow[i].scale.x;
					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.x = (ExtWindow[i].scale.x/2);
					leftShade[i].position.y = this.solarCube.scale.y/2+(leftShade[i].scale.y/2);
					leftShade[i].position.z = ExtWindow[i].position.z;

					rightShade[i].scale.y = ratioFin*ExtWindow[i].scale.x;
					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.x = -(ExtWindow[i].scale.x/2);
					rightShade[i].position.y = this.solarCube.scale.y/2+(rightShade[i].scale.y/2);
					rightShade[i].position.z = ExtWindow[i].position.z;
					break;
				case 1:
					ratioShade=ExtShade[i].scale.y/ExtWindow[i].scale.z;
					ratioFin=leftShade[i].scale.y/ExtWindow[i].scale.x;

					ExtWindow[i].scale.x = (windowtowall)*(this.solarCube.scale.x);
					ExtWindow[i].scale.z = (windowtowall)*(this.solarCube.scale.z);

					ExtShade[i].scale.x = ExtWindow[i].scale.x;
					ExtShade[i].scale.y= ratioShade*ExtWindow[i].scale.z;
					ExtShade[i].position.y = -this.solarCube.scale.y/2-(ExtShade[i].scale.y/2);
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.y = ratioFin*ExtWindow[i].scale.x;
					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.x = -(ExtWindow[i].scale.x/2);
					leftShade[i].position.y = -this.solarCube.scale.y/2-(leftShade[i].scale.y/2);
					leftShade[i].position.z = ExtWindow[i].position.z;

					rightShade[i].scale.y = ratioFin*ExtWindow[i].scale.x;
					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.x = (ExtWindow[i].scale.x/2);
					rightShade[i].position.y = -this.solarCube.scale.y/2-(rightShade[i].scale.y/2);
					rightShade[i].position.z = ExtWindow[i].position.z;
					break;
				case 2:
					ratioShade=ExtShade[i].scale.x/ExtWindow[i].scale.z;
					ratioFin=leftShade[i].scale.x/ExtWindow[i].scale.y;

					ExtWindow[i].scale.y = (windowtowall)*(this.solarCube.scale.y);
					ExtWindow[i].scale.z = (windowtowall)*(this.solarCube.scale.z);

					ExtShade[i].scale.y = ExtWindow[i].scale.y;
					ExtShade[i].scale.x= ratioShade*ExtWindow[i].scale.z;
					ExtShade[i].position.x = this.solarCube.scale.x/2+(ExtShade[i].scale.x/2);
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.x = ratioFin*ExtWindow[i].scale.y;
					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.y = (ExtWindow[i].scale.y/2);
					leftShade[i].position.x = this.solarCube.scale.x/2+(leftShade[i].scale.x/2);
					leftShade[i].position.z = ExtWindow[i].position.z;

					rightShade[i].scale.x = ratioFin*ExtWindow[i].scale.y;
					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.y = -(ExtWindow[i].scale.y/2);
					rightShade[i].position.x = this.solarCube.scale.x/2+(rightShade[i].scale.x/2);
					rightShade[i].position.z = ExtWindow[i].position.z;
					break;
				case 3:
					ratioShade=ExtShade[i].scale.x/ExtWindow[i].scale.z;
					ratioFin=leftShade[i].scale.x/ExtWindow[i].scale.y;

					ExtWindow[i].scale.y = (windowtowall)*(this.solarCube.scale.y);
					ExtWindow[i].scale.z = (windowtowall)*(this.solarCube.scale.z);

					ExtShade[i].scale.y = ExtWindow[i].scale.y;
					ExtShade[i].scale.x= ratioShade*ExtWindow[i].scale.z;
					ExtShade[i].position.x = -this.solarCube.scale.x/2-(ExtShade[i].scale.x/2);
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.x = ratioFin*ExtWindow[i].scale.y;
					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.y = -(ExtWindow[i].scale.y/2);
					leftShade[i].position.x = -this.solarCube.scale.x/2-(leftShade[i].scale.x/2);
					leftShade[i].position.z = ExtWindow[i].position.z;

					rightShade[i].scale.x = ratioFin*ExtWindow[i].scale.y;
					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.y = (ExtWindow[i].scale.y/2);
					rightShade[i].position.x = -this.solarCube.scale.x/2-(rightShade[i].scale.x/2);
					rightShade[i].position.z = ExtWindow[i].position.z;
					break;
				default: break;
  		}
		}


    $('#Window_U_Value').slider(enable ? "enable" : "disable");
    $('#Window_SHGC').slider(enable ? "enable" : "disable");
  },


  handleOverHang: function(evt, ui) {
    this.updateSliderDisplay(evt, ui);
    var enable = ui.value > 1;
		var i=1;
    ExtShade[i].scale.y= ui.value*ExtWindow[i].scale.z;
    ExtShade[i].position.y = -this.solarCube.scale.y/2-(ExtShade[i].scale.y/2);

  },

  handleFinL: function(evt, ui) {
    this.updateSliderDisplay(evt, ui);
    var enable = ui.value > 1;
		var i=1;
    leftShade[i].scale.y= ui.value*ExtWindow[i].scale.x;
    leftShade[i].position.y = -this.solarCube.scale.y/2-(leftShade[i].scale.y/2);
  },
 
 handleFinR: function(evt, ui) {
    this.updateSliderDisplay(evt, ui);
    var enable = ui.value > 1;
		var i=1;
    rightShade[i].scale.y= ui.value*ExtWindow[i].scale.x;
    rightShade[i].position.y = -this.solarCube.scale.y/2-(rightShade[i].scale.y/2);
  },

  handleSliderCheckboxChange: function(event) {
    var grId = '#'+event.target.id+'GR';
    $(grId).slider(event.target.checked ? "enable" : "disable");
    if (event.target.checked) {
      $(grId+'Disp').show();
    } else {
      $(grId+'Disp').hide();
    }
  },

  updateWidth: function(event, ui) {
    this.updateSliderDisplay(event, ui);
    this.solarCube.scale.x = ui.value*100;
		var i;
		for(i=0;i<4;i++){
			switch(i){
				case 0:
					ratio=ExtWindow[i].scale.z/this.solarCube.scale.z;
					ratioFin=leftShade[i].scale.y/ExtWindow[i].scale.x;

					ExtWindow[i].scale.x = (ratio)*(this.solarCube.scale.x);
					ExtWindow[i].scale.z = (ratio)*(this.solarCube.scale.z);

			//    this.sFacade.scale.x = this.solarCube.scale.x;
			//    this.sFacade.scale.z = this.solarCube.scale.z;

					ExtShade[i].scale.x = ExtWindow[i].scale.x;
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.y = ratioFin*ExtWindow[i].scale.x;
					leftShade[i].position.x = -(ExtWindow[i].scale.x/2);
					leftShade[i].position.y = this.solarCube.scale.y/2+(leftShade[i].scale.y/2);

					rightShade[i].scale.y = ratioFin*ExtWindow[i].scale.x;
					rightShade[i].position.x = (ExtWindow[i].scale.x/2);
					rightShade[i].position.y = this.solarCube.scale.y/2+(rightShade[i].scale.y/2);	

					break;
				case 1:
					ratio=ExtWindow[i].scale.z/this.solarCube.scale.z;
					ratioFin=leftShade[i].scale.y/ExtWindow[i].scale.x;

					ExtWindow[i].scale.x = (ratio)*(this.solarCube.scale.x);
					ExtWindow[i].scale.z = (ratio)*(this.solarCube.scale.z);

			//    this.sFacade.scale.x = this.solarCube.scale.x;
			//    this.sFacade.scale.z = this.solarCube.scale.z;

					ExtShade[i].scale.x = ExtWindow[i].scale.x;
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.y = ratioFin*ExtWindow[i].scale.x;
					leftShade[i].position.x = -(ExtWindow[i].scale.x/2);
					leftShade[i].position.y = -this.solarCube.scale.y/2-(leftShade[i].scale.y/2);

					rightShade[i].scale.y = ratioFin*ExtWindow[i].scale.x;
					rightShade[i].position.x = (ExtWindow[i].scale.x/2);
					rightShade[i].position.y = -this.solarCube.scale.y/2-(rightShade[i].scale.y/2);

				break;
				case 2:
/*
*/
					ExtWindow[i].position.x = 4+this.solarCube.scale.x/2;
			//    this.sFacade.position.y = -2-this.solarCube.scale.y/2;
					ExtShade[i].position.x = this.solarCube.scale.x/2+(ExtShade[i].scale.x/2);
					rightShade[i].position.x = this.solarCube.scale.x/2+(rightShade[i].scale.x/2);
					leftShade[i].position.x = this.solarCube.scale.x/2+(leftShade[i].scale.x/2);
				break;
				case 3:
					ExtWindow[i].position.x = -4-this.solarCube.scale.x/2;
			//    this.sFacade.position.y = -2-this.solarCube.scale.y/2;
					ExtShade[i].position.x = -this.solarCube.scale.x/2-(ExtShade[i].scale.x/2);
					rightShade[i].position.x = -this.solarCube.scale.x/2-(rightShade[i].scale.x/2);
					leftShade[i].position.x = -this.solarCube.scale.x/2-(leftShade[i].scale.x/2);
				break;
				default: break;
			}
		}
  },

  updateDepth: function(event, ui) {
    var i;
		this.updateSliderDisplay(event, ui);
    this.solarCube.scale.y = ui.value*100;
		for(i=0;i<4;i++){
			switch(i){
				case 0:
					ExtWindow[i].position.y = 4+this.solarCube.scale.y/2;
			//    this.sFacade.position.y = -2-this.solarCube.scale.y/2;
					ExtShade[i].position.y = this.solarCube.scale.y/2+(ExtShade[i].scale.y/2);
					rightShade[i].position.y = this.solarCube.scale.y/2+(rightShade[i].scale.y/2);
					leftShade[i].position.y = this.solarCube.scale.y/2+(leftShade[i].scale.y/2);
				break;
				case 1:
					ExtWindow[i].position.y = -4-this.solarCube.scale.y/2;
			//    this.sFacade.position.y = -2-this.solarCube.scale.y/2;
					ExtShade[i].position.y = -this.solarCube.scale.y/2-(ExtShade[i].scale.y/2);
					rightShade[i].position.y = -this.solarCube.scale.y/2-(rightShade[i].scale.y/2);
					leftShade[i].position.y = -this.solarCube.scale.y/2-(leftShade[i].scale.y/2);
				break;
				case 2:
					ratio=ExtWindow[i].scale.z/this.solarCube.scale.z;
					ratioFin=leftShade[i].scale.x/ExtWindow[i].scale.y;

					ExtWindow[i].scale.y = (ratio)*(this.solarCube.scale.y);
					ExtWindow[i].scale.z = (ratio)*(this.solarCube.scale.z);

			//    this.sFacade.scale.x = this.solarCube.scale.x;
			//    this.sFacade.scale.z = this.solarCube.scale.z;

					ExtShade[i].scale.y = ExtWindow[i].scale.y;
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.x = ratioFin*ExtWindow[i].scale.y;
					leftShade[i].position.y = -(ExtWindow[i].scale.y/2);
					leftShade[i].position.x = this.solarCube.scale.x/2+(leftShade[i].scale.x/2);

					rightShade[i].scale.x = ratioFin*ExtWindow[i].scale.y;
					rightShade[i].position.y = (ExtWindow[i].scale.y/2);
					rightShade[i].position.x = this.solarCube.scale.x/2+(rightShade[i].scale.x/2);
				break;
				case 3:
					ratio=ExtWindow[i].scale.z/this.solarCube.scale.z;
					ratioFin=leftShade[i].scale.x/ExtWindow[i].scale.y;

					ExtWindow[i].scale.y = (ratio)*(this.solarCube.scale.y);
					ExtWindow[i].scale.z = (ratio)*(this.solarCube.scale.z);

			//    this.sFacade.scale.x = this.solarCube.scale.x;
			//    this.sFacade.scale.z = this.solarCube.scale.z;

					ExtShade[i].scale.y = ExtWindow[i].scale.y;
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;

					leftShade[i].scale.x = ratioFin*ExtWindow[i].scale.y;
					leftShade[i].position.y = (ExtWindow[i].scale.y/2);
					leftShade[i].position.x = -this.solarCube.scale.x/2-(leftShade[i].scale.x/2);

					rightShade[i].scale.x = ratioFin*ExtWindow[i].scale.y;
					rightShade[i].position.y = -(ExtWindow[i].scale.y/2);
					rightShade[i].position.x = -this.solarCube.scale.x/2-(rightShade[i].scale.x/2);
				break;

				default: break;
  		}
		}
	},

  updateHeight: function(event, ui) {
    var i;
		this.updateSliderDisplay(event, ui);
    this.solarCube.scale.z = ui.value*100;
    this.solarCube.position.z = ui.value*100/2;

		for(i=0;i<4;i++){
			switch(i){
				case 0:
					ratioShade=ExtShade[i].scale.y/ExtWindow[i].scale.z;
					ratio=ExtWindow[i].scale.x/this.solarCube.scale.x;
				
					ExtWindow[i].scale.x = (ratio)*(this.solarCube.scale.x);
					ExtWindow[i].scale.z = (ratio)*(this.solarCube.scale.z);
					ExtWindow[i].position.z=this.solarCube.scale.z/2;
				
			//    this.sFacade.scale.x = this.solarCube.scale.x;
			//    this.sFacade.scale.z = this.solarCube.scale.z;
			//    this.sFacade.position.z=this.solarCube.position.z;

					ExtShade[i].scale.y= ratioShade*ExtWindow[i].scale.z;
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;
					ExtShade[i].position.y = this.solarCube.scale.y/2+(ExtShade[i].scale.y/2);

					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.z = ExtWindow[i].position.z;

					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.z = ExtWindow[i].position.z;
				break;
				case 1:
					ratioShade=ExtShade[i].scale.y/ExtWindow[i].scale.z;
					ratio=ExtWindow[i].scale.x/this.solarCube.scale.x;
				
					ExtWindow[i].scale.x = (ratio)*(this.solarCube.scale.x);
					ExtWindow[i].scale.z = (ratio)*(this.solarCube.scale.z);
					ExtWindow[i].position.z=this.solarCube.scale.z/2;
				
			//    this.sFacade.scale.x = this.solarCube.scale.x;
			//    this.sFacade.scale.z = this.solarCube.scale.z;
			//    this.sFacade.position.z=this.solarCube.position.z;

					ExtShade[i].scale.y= ratioShade*ExtWindow[i].scale.z;
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;
					ExtShade[i].position.y = -this.solarCube.scale.y/2-(ExtShade[i].scale.y/2);

					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.z = ExtWindow[i].position.z;

					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.z = ExtWindow[i].position.z;
				break;
				case 2:
					ratioShade=ExtShade[i].scale.x/ExtWindow[i].scale.z;
					ratio=ExtWindow[i].scale.y/this.solarCube.scale.y;
				
					ExtWindow[i].scale.y = (ratio)*(this.solarCube.scale.y);
					ExtWindow[i].scale.z = (ratio)*(this.solarCube.scale.z);
					ExtWindow[i].position.z=this.solarCube.scale.z/2;
				
			//    this.sFacade.scale.x = this.solarCube.scale.x;
			//    this.sFacade.scale.z = this.solarCube.scale.z;
			//    this.sFacade.position.z=this.solarCube.position.z;

					ExtShade[i].scale.x= ratioShade*ExtWindow[i].scale.z;
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;
					ExtShade[i].position.x = this.solarCube.scale.x/2+(ExtShade[i].scale.x/2);

					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.z = ExtWindow[i].position.z;

					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.z = ExtWindow[i].position.z;

				break;
				case 3:
					ratioShade=ExtShade[i].scale.x/ExtWindow[i].scale.z;
					ratio=ExtWindow[i].scale.y/this.solarCube.scale.y;
				
					ExtWindow[i].scale.y = (ratio)*(this.solarCube.scale.y);
					ExtWindow[i].scale.z = (ratio)*(this.solarCube.scale.z);
					ExtWindow[i].position.z=this.solarCube.scale.z/2;
				
			//    this.sFacade.scale.x = this.solarCube.scale.x;
			//    this.sFacade.scale.z = this.solarCube.scale.z;
			//    this.sFacade.position.z=this.solarCube.position.z;

					ExtShade[i].scale.x= ratioShade*ExtWindow[i].scale.z;
					ExtShade[i].position.z = ExtWindow[i].scale.z/2+this.solarCube.scale.z/2;
					ExtShade[i].position.x = -this.solarCube.scale.x/2-(ExtShade[i].scale.x/2);

					leftShade[i].scale.z = ExtWindow[i].scale.z;
					leftShade[i].position.z = ExtWindow[i].position.z;

					rightShade[i].scale.z = ExtWindow[i].scale.z;
					rightShade[i].position.z = ExtWindow[i].position.z;

				break;
				default: break;
			}
		}
  },


  updateSliderDisplay: function(event, ui) {
    this.setSliderDisplayValue('#'+event.target.id, ui.value);
  },

/*  updateMValueSliderDisplay: function(event, ui) {
    ui.value = this.MVALUES[ui.value];
    this.updateSliderDisplay(event, ui);
  },*/


  updateQValueSliderDisplay: function(event, ui) {
    ui.value = this.QVALUES[ui.value];
    this.updateSliderDisplay(event, ui);
  },

  updateDayOfYearSliderDisplay: function(event, ui) {
    var month = 0;
    var dayOfYear = ui.value;
    var curValue = 0;
    while (curValue < dayOfYear) {
      curValue += this.MONTH_LENGTHS[month];
      month += 1;
    }
    curValue -= this.MONTH_LENGTHS[month-1];
    var value = month + "/" + (dayOfYear - curValue);
    this.setSliderDisplayValue('#'+event.target.id, value);
    this.adjustSunPosition($('#hour-of-day-slider').slider('value'), dayOfYear,$("#orientation").slider('value'));
  },

  updateHourOfDaySliderDisplay: function(event, ui) {
    var value = ui.value + ":00";
    this.setSliderDisplayValue('#'+event.target.id, value);

    //this.sunLight.position.x=ui.value;
    //this.SunSphere.position.x=ui.value;
    this.adjustSunPosition(ui.value, $('#day-of-year-slider').slider('value'),$("#orientation").slider('value'));
  },

updateOrientaionDisplay: function(event, ui) {
    this.updateSliderDisplay(event, ui);
    this.adjustSunPosition($('#hour-of-day-slider').slider('value'), $('#day-of-year-slider').slider('value'),ui.value);
  },

  adjustSunPosition: function(hour, day, orientation) {
    var latitude = 45;
    var hour_of_day = hour;
    var day_number = day;
    var orient=orientation;
    var xcamera=this.camera.position.x;
    if (!this.SunSphere || !this.sunLight) {
      return;
    }

    //Convert radians to degrees
    var rtd = 180/Math.PI;
    // Convert degrees to radians
    var dtr = Math.PI/180;

    var hour_angle=(15 * hour_of_day) - 180;
    var solar_declination=23.45 * Math.sin( 2*Math.PI/365 * (day_number + 284) );
    var time_of_sunrise=12/Math.PI * Math.acos(Math.tan(dtr*(latitude)) * Math.tan(dtr*(solar_declination)));
    var time_of_sunset=12/Math.PI * (2*Math.PI - Math.acos(Math.tan(dtr*(latitude)) * Math.tan(dtr*(solar_declination))));
    var possible_sunshine_hours=time_of_sunset-time_of_sunrise;
    var solar_altitude= rtd*Math.asin((Math.sin(solar_declination*dtr) * Math.sin(latitude*dtr)) + (Math.cos(solar_declination*dtr)* Math.cos(latitude*dtr) * Math.cos(hour_angle*dtr)));
  
    if (hour_of_day === 12) {
      solar_azimuth= 180-orient;
    } else if (hour_of_day < 12) {
        solar_azimuth= 180-orient-rtd*Math.acos(((Math.sin(solar_altitude*dtr) * Math.sin(latitude*dtr)) - Math.sin(solar_declination*dtr)) / (Math.cos(solar_altitude*dtr) * Math.cos(latitude*dtr)));
    } else {
      solar_azimuth= 180-orient+rtd*Math.acos(((Math.sin(solar_altitude*dtr) * Math.sin(latitude*dtr)) - Math.sin(solar_declination*dtr)) / (Math.cos(solar_altitude*dtr) * Math.cos(latitude*dtr)));
    }

    var rt = hour_of_day - time_of_sunrise;
    var nt = hour_of_day - time_of_sunset;

    if (rt > 0 && nt < 0) {
      sun_nosun=1;
    } else {
      sun_nosun=0;
    }
  
    var multRad=1000*sun_nosun;
    var altitudeProjection=Math.cos(dtr*solar_altitude);
    var xcoord=-multRad*altitudeProjection*Math.sin(dtr*solar_azimuth);
    var ycoord=-multRad*altitudeProjection*Math.cos(dtr*solar_azimuth);
    var zcoord=multRad*Math.sin(dtr*solar_altitude);

  //this.camera.position.x=-xcoord;
  //this.camera.position.y=-ycoord;

    this.DIRcylinder.rotation.z = (orient/180)*Math.PI;
    this.DIRcylinder2.rotation.z = ((orient/180))*Math.PI;
    this.DIRcylinder2.position.x=1000*(Math.sin((orient/180)*Math.PI));
    this.DIRcylinder2.position.y=-1000*(Math.cos((orient/180)*Math.PI));
    this.SunSphere.position.x=xcoord;
    this.SunSphere.position.y=ycoord;
    this.SunSphere.position.z=zcoord;

    this.sunLight.position.x=3*xcoord;
    this.sunLight.position.y=3*ycoord;
    this.sunLight.position.z=3*zcoord;
  },

  setSliderDisplayValue: function(sliderId, val) {
    if (val === undefined) {
      val = $(sliderId).slider('value');
    }
    $(sliderId+'Disp').text(val);
  },

  handleContinentChange: function(evt) {
    var continent = evt.currentTarget.value;
    $.get('simulation/countries/'+continent, function(d) {
      var ctrl = $('#country');
      var first = null;
      ctrl.empty();
      _.each(d.values, function(object) {
        _.each(object, function(value, key) {
          if (!first) {
            first = key;
          }
          ctrl.append($("<option />").val(key).text(value.name));
        });
        $('#country').removeAttr('disabled');
        //$('#region').empty().attr('disabled', 'disabled');
        $('#WeatherFile').empty().attr('disabled', 'disabled');
      });
      this.handleCountryChange({ currentTarget: { value: first } });
    }.bind(this));
  },

  handleCountryChange: function(evt) {
    var continent = $('#continent').val();
    var country = evt.currentTarget.value;
    $.get('simulation/files/'+continent+'/'+country, function(files) {
      var ctrl = $('#WeatherFile');
      ctrl.empty();
      if (files) {
        _.each(files, function(file) {
          ctrl.append($("<option />").val(file).text(file));
          $('#WeatherFile').removeAttr('disabled');
        });
      }
    });
  },

  createRenderer: function(canvas) {
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColorHex(0xffffff, 1.0);
    renderer.setSize(canvas.innerWidth(), canvas.innerHeight());
    renderer.shadowMapEnabled=true;
    renderer.shadowMapType = THREE.BasicShadowMap;
    return renderer;
  },

  init: function() {
    var self = this;
    var container = $("#canvas");
    this.scene = new THREE.Scene();
    this.camera = this.createCamera(container);
    this.controls = this.createCanvasControls(container);
    this.createManualControls();
    this.renderer = this.createRenderer(container);
    container[0].appendChild(this.renderer.domElement);

    $.get('simulation/load/25', function(d) {
      if (d.status === 0) {
        transform = null; //self.buildOriginTransform(d.data.zone);
        self.initializeScene(self.scene, d.data.zone, transform);
      }
    });


    $('#windows-tabs').tabs({ active: 0, heightStyle: 'content' });
    //$('#facade-tabs').tabs({ active: 0, heightStyle: 'content' });
    $('#input-tabs').tabs({ active: 0, heightStyle: 'content' });
    $('#run-tabs').tabs({ active: 0, heightStyle: 'content' });

    // This forces the tabs to redraw correctly. Not sure why they don't without this.
    /*
    $('.input-wrapper-section').hide();
    window.setTimeout(function() {
      $('#input-tabs').tabs('option', 'active', 3).tabs('option', 'active', 0);
    }, 10);
    */

    /*
    var height = $('#inputs-panel').height();
    $('#inputs-panel').resizable({ handles: "ne, se, e", minHeight:  height, maxHeight: height });
    */


    // This help stuff is kludgy just to show that we can do it. It should be implemented better when we really have help.
    var helpDialog = $('#help-dialog').dialog({autoOpen: false, width: 700});
    var otherHelpDialog = $('#other-help-dialog').dialog({autoOpen: false});
    $('#show-help').on('click', function(evt) {
      evt.preventDefault();
      helpDialog.dialog('open');
    });
    $('#other-help').on('click', function(evt) {
      evt.preventDefault();
      otherHelpDialog.dialog('open');
    });
  },

  handleWindowResize: function() {
    var canvas = $('#canvas');
    var width = canvas.innerWidth();
    var height = canvas.innerHeight();
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  },

  toggleInputPanel: function() {
    var panel = $('#inputs-panel');
    var wrapper = $('#inputs-panel .panel-content');
    if (panel.css('width') === '20px') {
      panel.css('width', '200px');
      wrapper.show();
      $('#left-panel-toggle').text('X');
    } else {
      panel.css('width', '20px');
      wrapper.hide();
      $('#left-panel-toggle').text('>');
    }
  },

  animate: function(controls, renderer) {
    window.requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  },

  runSimulation: function() {
    var zone = { Window: null};
    var inverseTransform = new THREE.Matrix4();
    var progbar = $('#progressbar');

    $("#run-button").button("option", "disabled", true);
    $("#results").hide();
    progbar.progressbar({ value: false });
    progbar.show();

    zone.JobID = Math.uuid();
    zone.WeatherFile = "../weather/" + $("#continent").val() + "/" + $("#country").val() + "/" + $("#WeatherFile").val();
    zone.ModelFile = "";
    zone.Terrain = $("#terrain").val();
    zone.Orientation = $("#orientation").slider('value');
    zone.Width = $("#Width").slider('value');
    zone.Height = $("#Height").slider('value');
    zone.Depth = $("#Depth").slider('value');
    zone.OccupancyType = $("#occupancy-type").val();
    if ($("#Win").prop("checked")) {
      zone.WinGR = $("#WinGR").slider('value');
    } else {
      zone.WinGR = null;
    }
    zone.CoolingSP = $("#CoolingSP").slider('value');
    zone.HeatingSP = $("#HeatingSP").slider('value');
    zone.InsulationLevel = $("#insulation-level").slider('value');
    zone.RoofInsulationLevel = $("#roof-insulation-level").slider('value');
    zone.InfiltrationRate = $("#infiltration-rate").slider('value');
   // zone.Mvalue = this.MVALUES[$("#mvalue").slider('value')];
    zone.Qvalue = this.QVALUES[$("#qvalue").slider('value')];
		zone.RQvalue = this.QVALUES[$("#rqvalue").slider('value')];
    zone.Mvalue = $("#mvalue").slider('value');
    zone.RMvalue = $("#rmvalue").slider('value');
		zone.WindowType = $("#window-type").val();
    zone.WallType = $("#construction-type").val();
    zone.RoofType = $("#roof-type").val();
		zone.LFin = $("#LWinFinR").slider('value');
    zone.RFin = $("#RWinFinR").slider('value');
    zone.Overhang = $("#WinOverhangR").slider('value');

    $.post('simulation/run', zone, this.getSimulationResults.bind(this));
  },

  getSimulationResults: function(data, status) {
    //window.console.log(data);
    //window.console.log(status);
    $.get('simulation/' + data.jobId, this.handleSimulationResults.bind(this));

    // TODO: add some error checking
  },

  handleSimulationResults: function(results, status, xhr) {
    if (xhr.status === 200) {
      //window.console.log('simulation run finished');
      var progbar = $('#progressbar');
      progbar.hide();
      progbar.progressbar('destroy');
      $("#run-button").button("option", "disabled", false);
      $("#results").show();
      // $("#results").text(results);
      var vals = results.split(',');
      console.log(vals);
      var heatNoPCM = window.parseFloat(vals[7]);
      var coolNoPCM = window.parseFloat(vals[8]);
      var heatBioPCM = window.parseFloat(vals[11]);
      var coolBioPCM = window.parseFloat(vals[12]);
      $('#heat-nopcm').text(''+heatNoPCM);
      $('#cool-nopcm').text(''+coolNoPCM);
      $('#heat-biopcm').text(''+heatBioPCM);
      $('#cool-biopcm').text(''+coolBioPCM);
      $('#heat-savings').text(''+(Number(heatNoPCM-heatBioPCM).toFixed(2)));
      $('#cool-savings').text(''+(Number(coolNoPCM-coolBioPCM).toFixed(2)));
      $('#heat-percent-savings').text(''+(100-(Number(heatBioPCM/heatNoPCM*100).toFixed(0)))+'%');
      $('#cool-percent-savings').text(''+(100-(Number(coolBioPCM/coolNoPCM*100).toFixed(0)))+'%');
    } else {
      //window.console.log('simulation not finished');
      window.setTimeout(this.getSimulationResults.bind(this, results), 5000);
    }
  },

  initialize: function(options) {
    _.bindAll(this);
    this.model = new window.app.models.Simulation();
  },


  // NOTE: this is probably not the right way to implement this when using backbone. I'm not sure I understand what it does
  //       and it doesn't seem to make much differenct if I comment it out. I'd be happy to refactor it if I understood
  //       better what it is doing and how I can test it.
  onPageManipulations: function() {
    $(document).ready(function() {
      // global stuff that will be usefull throught
      var $win = $(window),
          $body = $('body'),
          curWinWidth = $win.width(),
          curWinHeight = $win.height(),
          timer,
          layoutView = 'small',
          smallMax = 640,
          mediumMax = 1024,
          checkLayout = function() {
            var $curWin = $(window);
            curWinWidth = $curWin.width();
            if ( curWinWidth <= smallMax ) {
              layoutView = 'small';
            } else if ( curWinWidth > smallMax && curWinWidth < mediumMax ) {
              layoutView = 'medium';
            } else {
              layoutView = 'large';
            }
            // console.log(layoutView);
          };

      var $mainContent = $('#main_content_id'),
          $mainHeader = $('#main_header_id'),
          levelContentHeight = function() {
            var mainHeaderHeight = $mainHeader.height(),
                newMainContnetHeight = curWinHeight - mainHeaderHeight;
            $mainContent.height(newMainContnetHeight);
          };


      // Panel Sliding
   //   var $resultsPanelToggle = $('#results_panel_toggle_id'),
   //       $inputsPanelToggle = $('#inputs_panel_toggle_id'),
   //       $resultsPanel = $('#results_panel_id'),
   //       $inputsPanel = $('#inputs_panel_id'),
   //       $panelToggles = $resultsPanelToggle.add($inputsPanelToggle);
   //   $resultsPanelToggle.data('togglePair', $resultsPanel);
   //   $inputsPanelToggle.data('togglePair', $inputsPanel);
   //   $resultsPanel.data('togglePair', $resultsPanelToggle);
   //   $inputsPanel.data('togglePair', $inputsPanelToggle);
   //   var closePanel = function($curPanel) {
  //    // close $curPanel
  //      $curPanel.addClass('closed');
  //      $($curPanel.data().togglePair).html('Open');
 //     },
 //     openPanel = function($curPanel) {
        // open $curPanel
 //       $($curPanel.data().togglePair).html('Close');
//        $curPanel.removeClass('closed');
 //     },
 //     togglePanel = function(clickedEl) {
 //       var $curPanel = $($(clickedEl).data().togglePair);
 //       if ( $curPanel.hasClass('closed') ) {
 //         openPanel($curPanel);
 //       } else {
 //         closePanel($curPanel);
 //       }
 //     };
 //     $panelToggles.click(function() {
  //      togglePanel(this);
  //    });


      // Initialize
      levelContentHeight();

      // NOTE - there is already a window resize handler (handleWindowResize() above) so this could just go in there
      // On Resize
      $win.resize(function() {
        clearTimeout(timer);     // NOTE that this timer variable is global since it is not the same scope as the declaration above
        // throttle the resize check
        timer = setTimeout(function() {
          // do resize stuff here
          checkLayout();
        }, 200);
      });
    });
  },

  render: function() {
    var self = this;
    this.$el.html(this.template(this.model.attributes));
    window.setTimeout(function() {
      self.init();
      self.animate();
      self.handleContinentChange({currentTarget: { value: $('#continent').val() } }); // Force
    }, 0);
    this.onPageManipulations();
    return this;

  }

});
