console.clear();

/* SETUP */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.z = 180;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* CONTROLS */
const controlsWebGL = new THREE.OrbitControls(camera, renderer.domElement);

/* PARTICLES */
const gradient = chroma.scale(["ef476f","ffd166","06d6a0","118ab2","073b4c"]);

const paths = document.querySelectorAll("path");
const vertices = [];
let colors = [];
let sizes = [];
const tl = gsap.timeline({
  onReverseComplete: () => {
    tl.timeScale(1);
    tl.play(0);
  },
  onComplete: () => {
    tl.timeScale(1.3);
    tl.reverse(0);
  }
});
let delay = 0;
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff
});
let totalLength = 0;
[...paths].forEach(p => totalLength += p.getTotalLength());
[...paths].reverse().forEach((path) => {
  const length = path.getTotalLength();
  for (let i = 0; i < length; i += 0.2) {
    const pointLength = i;
    const point = path.getPointAtLength(pointLength);
    const vector = new THREE.Vector3(
      point.x - 210.33 / 2,
      -point.y + 125.85 / 2,
      (Math.random() - 0.5) * 15
    );
    const end = new THREE.Vector3(
      vector.x + (Math.random() - 0.5) * 80,
      vector.y + (Math.random() - 0.5) * 80,
      vector.z + (Math.random() - 0.5) * 80
    );
    let coloursX = point.x / 210.33 + (Math.random() - 0.5) * 0.2;
    coloursX = end.distanceTo(new THREE.Vector3()) / 200;
    coloursX = (delay + pointLength) / totalLength;
    const color = gradient(coloursX).rgb();
    vector.opacity = 1;
    vertices.push(vector);
    vector.r = 1 - (vector.z + 7.5) / 15;
    vector.g = 1 - (vector.z + 7.5) / 15;
    vector.b = 1 - (vector.z + 7.5) / 15;
    tl.to(
      vector,
      {
        x: end.x,
        y: end.y,
        z: end.z,
        r: color[0] / 255,
        g: color[1] / 255,
        b: color[2] / 255,
        duration: 'random(0.5, 2)',
        ease: 'power2.out'
      },
      (delay + pointLength) * 0.0012 + 1.2
    );
    sizes.push((Math.random() * 6 + 2) * renderer.getPixelRatio());
  }
  delay += length;
});
const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
geometry.setAttribute(
  "customColor",
  new THREE.Float32BufferAttribute(colors, 3)
);
geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

let material = new THREE.ShaderMaterial({
  uniforms: {
    pointTexture: {
      value: new THREE.TextureLoader().load(
        "https://assets.codepen.io/127738/dotTexture.png"
      )
    }
  },
  vertexShader: document.getElementById("vertexshader").textContent,
  fragmentShader: document.getElementById("fragmentshader").textContent,
  transparent: true
});
const particles = new THREE.Points(geometry, material);
scene.add(particles);

/* RENDERING */
function render() {
  requestAnimationFrame(render);
  
  geometry.setFromPoints(vertices);
  
  let colours = [];
  vertices.forEach(v => {
    colours.push(v.r, v.g, v.b);
  });
  geometry.setAttribute("customColor", new THREE.Float32BufferAttribute(colours, 3));

  renderer.render(scene, camera);
}

/* EVENTS */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function onMouseMove(e) {
  const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
  const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  gsap.to(particles.rotation, {
    x: y * 0.2,
    y: x * 0.2,
    ease: 'power2.out',
    duration: 2
  });
}
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('mousemove', onMouseMove, false);

requestAnimationFrame(render);