/* COMPSCI 373 Project 4: Subdivision Surfaces */

const panelSize = 600;
const fov = 35;  // camera's field of view
const aspect = 1;
let scene, renderer, camera, material, orbit, light, surface=null;
let nsubdiv = 0;  // number of subdivisions

let coarseMesh = null;  // the original input triangle mesh
let currMesh = null;    // current triangle mesh

let flatShading = true;
let wireFrame = false;

let objStrings = [  // predefined coarse mesh data
	box_obj,
	ico_obj,
	torus_obj,
	twist_obj,
	combo_obj,
	pawn_obj,
	bunny_obj,
	head_obj,
	hand_obj,
	klein_obj
];

let objNames = [
	'box',
	'ico',
	'torus',
	'twist',
	'combo',
	'pawn',
	'bunny',
	'head',
	'hand',
	'klein'
];

function id(s) {return document.getElementById(s);}
function message(s) {id('msg').innerHTML=s;}

function subdivide() {
	let currVerts = currMesh.vertices;  // input vertex array
	let currFaces = currMesh.faces;     // input face/triangle array
	let newVerts = [];  // output vertex array
	let newFaces = [];  // output face/triangle array

	/* You can access the input mesh data through
	 * currVerts and currFaces arrays.
	 * Compute one round of Loop's subdivision and
	 * output new mesh to newVerts and newFaces arrays.
	 */

/* Really cool crystialzation subdivison i accidentally did

// Clone old vertices for new one
// Make vertex adjacency structure which holds each vertexs neighbors as seen by the face data
// Make edge data structure, an array of paired vertices that each defines an edge
// One new vertex for each edge in old faces

// 1st clone
newVerts = currVerts.map(v => {
	return v.clone();
})

//2nd, need to make vertex adjaceny structure which holds the index neighboros of each vertex. This will be used to make the weighted sums to update the old vertices
	// Loop through vertex data, for each we loop through face and find all of its neighbors? Stop when weve found it twice?
	// Or do we loop through the face data and log the three neighbors for each, by index, and 
let vertexAdj = {};
currFaces.forEach(f => {
	function addNeighbors(v,b,c){
		if(Object.keys(vertexAdj).includes(v.toString())){ //Vertex array arlready made, append
			if(!vertexAdj[v].includes(b)){vertexAdj[v].push(b);} //Add vertex if not already added
			if(!vertexAdj[v].includes(c)){vertexAdj[v].push(c);} //Add vertex if not already added
			//console.log("here"); //It is possible that the issue is that we are not going in here, just constantly overriding below
		}  
		else{
			vertexAdj[v] = [b,c];
		}
	}
	addNeighbors(f.a,f.b,f.c); addNeighbors(f.b,f.a,f.c); addNeighbors(f.c,f.b,f.a); //Subtract one from indexes?
});

//3rd, update old vertices with sum of neighbors. This happens before the foruth step since we dont want to do this process to the new ones
let vIndex = 0; //keep track of index for vertex so we can use adjacency structure
newVerts = newVerts.map(v => {
	let neighbors = vertexAdj[vIndex];
	//if(neighbors == null){ console.log(vIndex, vertexAdj)}
	let k = neighbors.length; //Error here for when v is 0. Why, what is going on with indexing?
	let b = (1/k)*((5/8) - Math.pow(((3/8)+(1/4)*Math.cos((2*Math.PI)/k)),2)); //formula to find b from slides
	let nV = []; //holds elements of new vertex
	["x","y","z"].forEach(e => { //we use e to designate the elements of the vector we want
		let nSum = 0;
		neighbors.forEach(n => {nSum += n[e]*b}); //summing the weights of neighbors
		let p = v[e]*(1-k*b) + nSum; //formula to calculate updated vertex taken from slides
		nV.push(p); //append for each element
	});
	vIndex++; //increment the index 
	return new THREE.Vector3(nV[0],nV[1],nV[2]);
});

// 4th, use the old face data to make edge data structure. Make the needed new vertex at each
	// The edge data is taken from the face data, each face gives 3 edges. Each edge will hold the indexes of the assoicated vertices, as well as the two vertices it is next to (so the 4 vertices that make up two triangles)
	// Each edge appears twice in the face data, so need to deal with duplicates
	// The edge data may also have index of the new vertex we make
	// An edge index is defined by index1"-"index2
	// Need to use adjaceny structure to know what faces are next to eachtoher
	// Each face is giving us 3 edge infos!
	// Check if we already have the edge by 

// A face looks like 
let edgeData = [];
currFaces.forEach(f => {
	// We can get 3/4 vertices needed from f, but need the last one using the vertex adjaceny matrix, by finding the common niehgbor of pairs of two of these. 
	let p0 = f.a; let p1 = f.b; let p2 = f.c; //p3 will be commonality between two others using .some
	// Can loop through 3 times, calculating a new vertx and edge each time, and a new p3 value
	function addEdges(v0,v1,n0){
		if(edgeData.some(e => (e.v0 == v0 && e.v1 == v1))){ //edge already exists
			return;
		}
		else{ //Edge does not exist. Need to find fourth vertex and calculate the new one, add new one to new vertex data, and store that new index into this
			let n1;
			vertexAdj[v0].forEach(v => {
				for(let j = 0; j < vertexAdj[v1].length; j++){ //loop through v1 and see if any are equal
					let n = vertexAdj[v1][j]; //This is a possible candidate that could be the foruth neighbor
					if(n == v && n != n0){ //If one is equal to any in v0, and not the other neighbor then they share that neighbor and thus it must be the other vertex in their triangle
						n1 = v; //This is the second neighbor to the edge we want to use in the wighted sum
					}
				}
			});
			//console.log(n1, vertexAdj[v1], vertexAdj[v0]); //This tests to see adjacency. It seems everything has only two neighbor swhich makes no sense so my adjacency structure is wrong
			let arr = [];
			let a = currVerts[v0]; let b = currVerts[v1]; let c = currVerts[n0]; let d = currVerts[n1]; //Need to get the actual vector values for these using the indexs we got from face data
			["x","y","z"].forEach(e => { //we use e to designate the elements of the vector we want
				let p = (3/8)*a[e] + (3/8)*b[e] + (1/8)*c[e] + (1/8)*d[e]; //formula to calculate new vertex taken from slides
				arr.push(p); //push for each element
			});
			newVerts.push(new THREE.Vector3(arr[0],arr[1],arr[2])); //New vertex we calculated with the weights, created as a vector object and added to the new vertex list
			edgeData.push({v0: v0, v1: v1, n0: n0, n1: n1, v: newVerts.length-1 }); //we do legth -1 because that is the index of the last vector added
		}
	}
	//Using ternary operators to determine which index is greater and thus which order to store them in. This is important when we check
	p0 < p1 ? addEdges(p0,p1,p2) : addEdges(p1,p0,p2);
	p1 < p2 ? addEdges(p1,p2,p0) : addEdges(p2,p1,p0);
	p0 < p2 ? addEdges(p0,p2,p1) : addEdges(p2,p0,p1);
	}
);

// 5th, add new faces somehow. We should have all the neccessary new vertices, but how do we find new faces?
	// How do we find new faces. I assume using the edge data
	// We know each face makes four new faces
	// Loop through old faces and subdivide into 4 new ones to add to currFaces
	// At each triangle, we use new verts and edge data to define the edges of the four new triangles
	// Each edge data has index of new vertex we added, so use that to define the new edges
	// All updated vertices have the same index as before that is chill. The new ones are found in the edge data structure
	// Each edge of the triangle has a new vertex, so the four triangles made are defined by 3 updated vertices and 3 new vertices for each edge. 
	// Edges are shared in two triangles, so new vertex is used for each
	// What if we iterate through edge data? 
	// 		a
	// 	   / \
	//    b - c
currFaces.forEach(f => {
	let arr = [f.a,f.b,f.c].sort((a,b) => a-b); //Order matters, important when we find the new vertex in the edge data
	if(!edgeData.find(e => (e.v0 == arr[0] && e.v1 == arr[1]))){console.log(edgeData,arr[0],arr[1],arr)}
	let ab = edgeData.find(e => (e.v0 == arr[0] && e.v1 == arr[1])).v; //find middle vertex edge, use to make new faces
	let ac = edgeData.find(e => (e.v0 == arr[0] && e.v1 == arr[2])).v;
	let bc = edgeData.find(e => (e.v0 == arr[1] && e.v1 == arr[2])).v;
	newFaces.push(new THREE.Face3(ab,bc,ac)); //add middle triangle to faces, from online picture 
	newFaces.push(new THREE.Face3(ab,arr[1],bc)); // Add outer triangles, from online picture
	newFaces.push(new THREE.Face3(ac,bc,arr[2]));
	newFaces.push(new THREE.Face3(ac,arr[0],ab));
})
*/

// ===YOUR CODE STARTS HERE===
// Clone old vertices for new one
// Make vertex adjacency structure which holds each vertexs neighbors as seen by the face data
// Make edge data structure, an array of paired vertices that each defines an edge
// One new vertex for each edge in old faces

// 1st clone
newVerts = currVerts.map(v => {
	return v.clone();
})

//2nd, need to make vertex adjaceny structure which holds the index neighboros of each vertex. This will be used to make the weighted sums to update the old vertices
	// Loop through vertex data, for each we loop through face and find all of its neighbors? Stop when weve found it twice?
	// Or do we loop through the face data and log the three neighbors for each, by index, and 
let vertexAdj = {};
currFaces.forEach(f => {
	function addNeighbors(v,b,c){
		if(Object.keys(vertexAdj).includes(v.toString())){ //Vertex array arlready made, append
			if(!vertexAdj[v].includes(b)){vertexAdj[v].push(b);} //Add vertex if not already added
			if(!vertexAdj[v].includes(c)){vertexAdj[v].push(c);} //Add vertex if not already added
		}  
		else{
			vertexAdj[v] = [b,c];
		}
	}
	addNeighbors(f.a,f.b,f.c); addNeighbors(f.b,f.a,f.c); addNeighbors(f.c,f.b,f.a); //Subtract one from indexes?
});

//3rd, update old vertices with sum of neighbors. This happens before the foruth step since we dont want to do this process to the new ones
let vIndex = 0; //keep track of index for vertex so we can use adjacency structure
newVerts = newVerts.map(v => {
	let neighbors = vertexAdj[vIndex];
	let k = neighbors.length; 
	let b = (1/k)*((5/8) - Math.pow(((3/8)+(1/4)*Math.cos((2*Math.PI)/k)),2)); //formula to find b from slides
	let arr = []; //holds elements of new vertex
	["x","y","z"].forEach(e => { //we use e to designate the elements of the vector we want
		let nSum = 0;
		neighbors.forEach(n => {nSum += currVerts[n][e]*b}); //summing the weights of neighbors //n is an index not a fucking thing!
		let p = v[e]*(1-(k*b)) + nSum; //formula to calculate updated vertex taken from slides
		arr.push(p); //append for each element
	});
	vIndex++; //increment the index 
	return new THREE.Vector3(arr[0],arr[1],arr[2]);
});

// 4th, use the old face data to make edge data structure. Make the needed new vertex at each
	// The edge data is taken from the face data, each face gives 3 edges. Each edge will hold the indexes of the assoicated vertices, as well as the two vertices it is next to (so the 4 vertices that make up two triangles)
	// Each edge appears twice in the face data, so need to deal with duplicates
	// The edge data may also have index of the new vertex we make
	// An edge index is defined by index1"-"index2
	// Need to use adjaceny structure to know what faces are next to eachtoher
	// Each face is giving us 3 edge infos!
	// Check if we already have the edge by 

// A face looks like 
let edgeData = [];
currFaces.forEach(f => {
	// We can get 3/4 vertices needed from f, but need the last one using the vertex adjaceny matrix, by finding the common niehgbor of pairs of two of these. 
	// Can loop through 3 times, calculating a new vertx and edge each time, and a new p3 value
	let arr = [f.a,f.b,f.c].sort((a,b) => a-b);
	function addEdges(v0,v1,n0){
		if(edgeData.find(e => (e.v0 == v0 && e.v1 == v1)) != null){ //edge already exists
			return;
		}
		else{ //Edge does not exist. Need to find fourth vertex and calculate the new one, add new one to new vertex data, and store that new index into this
			let n1;
			vertexAdj[v0].forEach(v => {
				for(let j = 0; j < vertexAdj[v1].length; j++){ //loop through v1 and see if any are equal
					let n = vertexAdj[v1][j]; //This is a possible candidate that could be the foruth neighbor
					if(n == v && n != n0){ //If one is equal to any in v0, and not the other neighbor then they share that neighbor and thus it must be the other vertex in their triangle
						if(currFaces.find(f => ((f.a == n || f.b == n || f.c == n) && (f.a == v0 || f.b == v0 || f.c == v0) && (f.a == v1 || f.b == v1 || f.c == v1)))) //If statement added due to twisting bug, to make sure neighbor of both actually is a face that exists
							{n1 = v}; //This is the second neighbor to the edge we want to use in the wighted sum
					}
				}
			});
			let arr = [];
			let a = currVerts[v0]; let b = currVerts[v1]; let c = currVerts[n0]; let d = currVerts[n1]; //Need to get the actual vector values for these using the indexs we got from face data
			["x","y","z"].forEach(e => { //we use e to designate the elements of the vector we want
				let p = (3/8)*a[e] + (3/8)*b[e] + (1/8)*c[e] + (1/8)*d[e]; //formula to calculate new vertex taken from slides
				arr.push(p); //push for each element
			});
			newVerts.push(new THREE.Vector3(arr[0],arr[1],arr[2])); //New vertex we calculated with the weights, created as a vector object and added to the new vertex list
			edgeData.push({v0: v0, v1: v1, n0: n0, n1: n1, v: newVerts.length-1 }); //we do legth -1 because that is the index of the last vector added
		}
	}
	//Using ternary operators to determine which index is greater and thus which order to store them in. This is important when we check
	addEdges(arr[0],arr[1],arr[2]); //In order by array. All possible pairs and their neighbor
	addEdges(arr[1],arr[2],arr[0]);
	addEdges(arr[0],arr[2],arr[1]);
	}
);


// 5th, add new faces somehow. We should have all the neccessary new vertices, but how do we find new faces?
	// How do we find new faces. I assume using the edge data
	// We know each face makes four new faces
	// Loop through old faces and subdivide into 4 new ones to add to currFaces
	// At each triangle, we use new verts and edge data to define the edges of the four new triangles
	// Each edge data has index of new vertex we added, so use that to define the new edges
	// All updated vertices have the same index as before that is chill. The new ones are found in the edge data structure
	// Each edge of the triangle has a new vertex, so the four triangles made are defined by 3 updated vertices and 3 new vertices for each edge. 
	// Edges are shared in two triangles, so new vertex is used for each
	// What if we iterate through edge data? 
	// 		a
	// 	   / \
	//    b - c

currFaces.forEach(f => {

	//ab:
	let abArr = [f.a,f.b].sort((a,b) => a-b);
	let ab = edgeData.find(e => (e.v0 == abArr[0] && e.v1 == abArr[1])).v; //find middle vertex edge, use to make new faces
	//ac
	let acArr = [f.a,f.c].sort((a,b) => a-b);
	let ac = edgeData.find(e => (e.v0 == acArr[0] && e.v1 == acArr[1])).v;
	//bc
	let bcArr = [f.b,f.c].sort((a,b) => a-b);
	let bc = edgeData.find(e => (e.v0 == bcArr[0] && e.v1 == bcArr[1])).v;

	newFaces.push(new THREE.Face3(ab,bc,ac)); //add middle triangle to faces, from online picture 
	newFaces.push(new THREE.Face3(ab,f.b,bc)); // Add outer triangles, from online picture
	newFaces.push(new THREE.Face3(ac,bc,f.c));
	newFaces.push(new THREE.Face3(ac,f.a,ab));

});

// ---YOUR CODE ENDS HERE---

	/* Overwrite current mesh with newVerts and newFaces */
	currMesh.vertices = newVerts;
	currMesh.faces = newFaces;
	/* Update screen drawing */
	updateSurfaces();
}

window.onload = function(e) {
	// create scene, camera, renderer, light, and orbit controls
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100 );
	camera.position.set(-1, 1, 3);
	
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(panelSize, panelSize);
	renderer.setClearColor(0x202020);
	id('surface').appendChild(renderer.domElement);	// bind renderer to HTML div element
	orbit = new THREE.OrbitControls(camera, renderer.domElement);
	
	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(camera.position.x, camera.position.y, camera.position.z);	// right light
	scene.add(light);

	let amblight = new THREE.AmbientLight(0x202020);	// ambient light
	scene.add(amblight);
	
	// create material
	material = new THREE.MeshPhongMaterial({color:0xCC8033, specular:0x101010, shininess: 50});
	
	// create current mesh object
	currMesh = new THREE.Geometry();
	
	// load first predefined coarse mesh
	loadOBJ(objStrings[0]);
}

function updateSurfaces() {
	currMesh.verticesNeedUpdate = true;
	currMesh.elementsNeedUpdate = true;
	currMesh.computeFaceNormals(); // compute face normals
	if(!flatShading) currMesh.computeVertexNormals(); // if smooth shading
	else currMesh.computeFlatVertexNormals(); // if flat shading
	
	if (surface!=null) {
		scene.remove(surface);	// remove old surface from scene
		surface.geometry.dispose();
		surface = null;
	}
	material.wireframe = wireFrame;
	surface = new THREE.Mesh(currMesh, material); // attach material to mesh
	scene.add(surface); // add new surface to the scene
}

function loadOBJ(objstring) {
	loadOBJFromString(objstring, function(mesh) {
		coarseMesh = mesh;
		currMesh.vertices = mesh.vertices;
		currMesh.faces = mesh.faces;
		updateSurfaces();
		nsubdiv = 0;
	},
	function() {},
	function() {});
}

function onKeyDown(event) { // Key Press callback function
	switch(event.key) {
		case 'w':
		case 'W':
			wireFrame = !wireFrame;
			message(wireFrame ? 'wireframe rendering' : 'solid rendering');
			updateSurfaces();
			break;
		case 'f':
		case 'F':
			flatShading = !flatShading;
			message(flatShading ? 'flat shading' : 'smooth shading');
			updateSurfaces();
			break;
		case 's':
		case 'S':
		case ' ':
			if(nsubdiv>=5) {
				message('# subdivisions at maximum');
				break;
			}
			subdivide();
			nsubdiv++;
			updateSurfaces();
			message('# subdivisions = '+nsubdiv);
			break;
		case 'e':
		case 'E':
			currMesh.vertices = coarseMesh.vertices;
			currMesh.faces = coarseMesh.faces;
			nsubdiv = 0;
			updateSurfaces();
			message('# subdivisions = '+nsubdiv);
			break;
		case 'r':
		case 'R':
			orbit.reset();
			break;
			
	}
	if(event.key>='0' && event.key<='9') {
		let index = 9;
		if(event.key>'0')	index = event.key-'1';
		if(index<objStrings.length) {
			loadOBJ(objStrings[index]);
			message('loaded mesh '+objNames[index]);
		}
	}
}

window.addEventListener('keydown',  onKeyDown,  false);

function animate() {
	requestAnimationFrame( animate );
	//if(orbit) orbit.update();
	if(scene && camera)	{
		light.position.set(camera.position.x, camera.position.y, camera.position.z);
		renderer.render(scene, camera);
	}
}

animate();
