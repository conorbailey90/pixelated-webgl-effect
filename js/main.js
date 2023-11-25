import '../style.css'
import * as THREE from 'three';
import { SmoothScroll } from './smoothScroll';
import fragment from './shaders/fragment.glsl';
import vertex from "./shaders/vertex.glsl";

const canvas = document.querySelector('.webgl')
const scrollable = document.querySelector('.scrollable');

class CanvasWebgl{
  constructor(canvas){
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.textureLoader = new THREE.TextureLoader();
    this.images = [...document.querySelectorAll('img')];
    this.meshes = [];
    this.mouse = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      vX: 0,
      vY: 0,
      windowX: 0,
      windowY: 0
    }
    this.setDimensions();
    this.setup();
    this.addEventListeners()
    this.createMesh()

    // Smooth scroll
    this.smoothScroll = new SmoothScroll(scrollable);
    this.animate();
  }

  setDimensions(){
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    this.aspectRatio = this.sizes.width / this.sizes.height 
  }

  setup(){
    this.perspective = 1000;
    this.fov = 2* Math.atan((this.sizes.height / 2) / this.perspective) * 180 / Math.PI;
    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 0.1,2000)
    this.camera.position.z = this.perspective;
    this.scene.add(this.camera)

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
  }

  addEventListeners(){
    // Reset camera dimensions on screen resize
    window.addEventListener('resize', () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight
      this.aspectRatio = this.sizes.width / this.sizes.height;
      // Update camera
    
      this.camera.aspect = this.aspectRatio;
      this.camera.fov = 2* Math.atan((this.sizes.height / 2) / this.perspective) * 180 / Math.PI;
      this.camera.updateProjectionMatrix();
  
      // Update Renderer
      this.renderer.setSize(this.sizes.width, this.sizes.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
    })

    // Mouse Events
    window.addEventListener('mousemove', (e) => {

      this.mouse.windowX = e.clientX;
      this.mouse.windowY = e.clientY;

      this.mouse.x = e.clientX / this.sizes.width;
      this.mouse.y = e.clientY / this.sizes.height;
      
      // Speed of the mouse

      this.mouse.vX = this.mouse.x - this.mouse.prevX;
      this.mouse.vY = this.mouse.y - this.mouse.prevY;

      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
    })
  }

  createMesh(){
    for(let i = 0; i < this.images.length; i++){
      let imageTexture = this.textureLoader.load(this.images[i].src);
      imageTexture.colorSpace = THREE.SRGBColorSpace;
      let mesh = new MeshItem(this.images[i], imageTexture, this.scene, this.mouse);
      this.meshes.push(mesh);
    
    }
  }

  animate(){
    this.smoothScroll.animate()
    for(let i = 0; i < this.meshes.length; i++){
      this.meshes[i].updateMesh();
    }
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.animate.bind(this))
  }
}


class MeshItem{
  constructor(src, texture, scene, mouse){
    this.src = src;
    this.texture = texture;
    this.scene = scene;
    this.mouse = mouse;
    
    this.offset = new THREE.Vector2(0,0); // Positions of mesh on screen. Will be updated below.
    this.sizes = new THREE.Vector2(0,0); //Size of mesh on screen. Will be updated below.
    this.setDimensions()
    this.createMesh()
  }

  setDimensions(){
    const {width, height, top, left} = this.src.getBoundingClientRect();
    this.sizes.set(width, height);
    this.offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2); 

    // Mouse
    this.mousePosX = (this.mouse.windowX - left) / width;
    this.mousePosX = this.mousePosX < 0 ? 0 : this.mousePosX > 1 ? 1 : this.mousePosX;

    this.mousePosY = (this.mouse.windowY - top) / height;
    this.mousePosY = this.mousePosY < 0 ? 0 : this.mousePosY > 1 ? 1 : this.mousePosY;
    
    console.log(this.mousePosY)
}

  createMesh(){
    // create a buffer with color data
      this.size = 32 ;
      const width = this.size;
      const height = this.size;

      const size = width * height;
      const data = new Float32Array( 4 * size );
      // const color = new THREE.Color( 0xffffff );

      // const r = Math.floor( color.r * 255 );
      // const g = Math.floor( color.g * 255 );
      // const b = Math.floor( color.b * 255 );

      for ( let i = 0; i < size; i ++ ) {
        let r = Math.random() * 255;
        const stride = i * 4;
        data[ stride ] = r;
        data[ stride + 1 ] = r;
        data[ stride + 2 ] = r;
        data[ stride + 3 ] = 255;
      }

    // used the buffer to create a DataTexture
    this.dataTexture = new THREE.DataTexture( data, width, height, THREE.RGBAFormat, THREE.FloatType );
    this.dataTexture.needsUpdate = true;
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1,1,100,100),
      new THREE.ShaderMaterial({
          side: THREE.DoubleSide,
          uniforms: {
            time: {value: 0},
            resolution: {value: new THREE.Vector4()},
            uTexture: {value: this.texture},
            uDataTexture: {value: this.dataTexture}
          },
          vertexShader: vertex,
          fragmentShader: fragment
        }
      )
    )
    this.scene.add(this.mesh);
  }

  updateDataTexture(){
   
    let data = this.dataTexture.image.data;
    for(let i = 0; i < data.length; i+= 4){
      data[i] *= .9;
      data[i + 1] *= .9;
    }
    
    if(this.mousePosX > 0 && this.mousePosX < 1 && this.mousePosY > 0 && this.mousePosY < 1 ){
      let gridMouseX = this.size * this.mousePosX;
      let gridMouseY = this.size * (1 - this.mousePosY);
      let maxDist = this.size / 4;

      for(let i = 0; i < this.size; i++){
        for(let j = 0; j < this.size; j++){
          let distance = (gridMouseX - i)**2 + (gridMouseY - j)**2;
          let maxDistSq = maxDist**2;
  
          if(distance < maxDistSq){
            let index = 4 * (i + this.size * j)
            let power = maxDist/Math.sqrt(distance);
  
            data[index] += 100 * this.mouse.vX * power;
            data[index + 1] -= 100 * this.mouse.vY * power;
          }
        }
      }
    }
   
   

    this.mouse.vX *= 0.9
    this.mouse.vY *= 0.9
    this.dataTexture.needsUpdate = true;
  }

  updateMesh(){
    this.setDimensions();
    this.updateDataTexture()
    this.mesh.position.set(this.offset.x, this.offset.y, 0);
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
  }
}
new CanvasWebgl(canvas)

