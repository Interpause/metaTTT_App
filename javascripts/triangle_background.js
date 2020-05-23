/** Default settings for the generated background. */
const bgDefaults = {};

// Number of rows and columns of triangle sets
bgDefaults.rows = 10;
bgDefaults.cols = 4;

// In seconds, the speed of color change
bgDefaults.min_speed = 20;
bgDefaults.max_speed = 50;

// Other aesthetic settings
bgDefaults.gap_ratio = 0.15;  // Size of gap in relation to the triangles
bgDefaults.randomness = 0.75; // Smart random seriousness

// Permanent settings and Maths calculations
const tlen = 100;					// Base of triangles in arbitrary SVG units
const thgt = tlen/2*1.732050808;	// Height of triangles in arbitrary SVG units

// Colors that triangles change between.
bgDefaults.colors = ['#ffffff','#0c7c5f','#000000',
					'#fab20b','#e62840','#8862b8',
					'#fddb0d','#deddde','#ffffff',
					'#0c7c5f','#000000'];

// Shuffles color sequence of triangle based on triangle on top and to the left of it
function smart_shuffle(above,left,conf){
	let frndarr = conf.colors.slice();
	let shuffled = [];
	
	//assuming its in list, highly likely considering context of usage
	if (Math.random() < conf.randomness && above != undefined) frndarr.splice(frndarr.indexOf(above),1); 
	if (Math.random() < conf.randomness && left != undefined) frndarr.splice(frndarr.indexOf(left),1);
	
	shuffled.push(frndarr[Math.floor(Math.random() * frndarr.length)]);
	let nrndarr = conf.colors.slice();
	nrndarr.splice(nrndarr.indexOf(shuffled[0]),1);
	
	for (let i = nrndarr.length - 1; i>0; i--){
		let j = Math.floor(Math.random() * (i + 1));
		[nrndarr[i], nrndarr[j]] = [nrndarr[j], nrndarr[i]];
	}
	
	return shuffled.concat(nrndarr);
}

// Randomly generates the color and animation information of triangle
function gen_tri(above,left,conf){
	let tri = {};
	let r_seq = smart_shuffle(above,left,conf);
	r_seq.push(r_seq.slice(0,1)[0]);
	tri['color_seq'] = r_seq;
	tri['speed'] = Math.floor(Math.random()*(conf.max_speed-conf.min_speed))+conf.min_speed;
	return tri;
}

//Read-only outside of module.					
module.exports.bgDefaults = bgDefaults;

/** Generates SVG background. Pass changes to default settings as Object. */
module.exports.genBg = function(kwargs){
	let conf = Object.assign({},bgDefaults);
	if(kwargs!=null) Object.entries(kwargs).forEach(([k,v])=>conf[k]=v);
	
	//Maths
	let glen = tlen/2*conf.gap_ratio;	// Length of gap between triangles in arbitrary SVG units
	let lglen = glen/2;					// Horizontal offset for triangle points in arbitrary SVG units
	let hglen = glen/2*0.866025404;		// Vertical offset for triangle points in arbitrary SVG units
	let width = tlen*conf.cols;			// Width of SVG
	let height = thgt*conf.rows+hglen/4;// Height of SVG
	
	let container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	container.setAttribute('xmlns','http://www.w3.org/2000/svg');
	container.setAttribute('viewBox',`0 0 ${width} ${height}`);
	container.setAttribute('shape-rendering','geometricPrecision');
	
	let bg = document.createElementNS("http://www.w3.org/2000/svg", 'g');
	container.appendChild(bg);
	
	//Tracks triangle colors for smart random
	let prevarr = []; 		// Previous row of triangles
	let curarr = [];  		// Current row of triangles
	let prevc = undefined;	// Color of previous generated triangle
	
	//Flags
	let isUpright = false;  //Each row is flipped upside down from the next
	
	for(let y = 0; y < conf.rows*2; y++){
		if(y%2==0) isUpright = true;
		else isUpright = false;
		
		//For first triangle (wrapped around screen)
		let tri1 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		let tri2 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		
		//Fill of triangle
		let tri_p = gen_tri(prevarr[0],prevc,conf);
		tri1.setAttribute('fill',tri_p['color_seq'][0]);
		tri2.setAttribute('fill',tri_p['color_seq'][0]);
		curarr.push(tri_p['color_seq'][0]);
		prevc = tri_p['color_seq'][0];
		
		//Different calculation of points if triangle upright versus not
		let p1x1 = 0;
		let p1y1 = y*thgt+((isUpright)?hglen:glen)/2;
		let p2x1 = 0;
		let p2y1 = (y+1)*thgt-((isUpright)?glen:hglen)/2;
		let p3x1 = tlen/2-lglen;
		let p3y1 = (isUpright)?y*thgt+hglen/2:(y+1)*thgt-hglen/2;
		
		let p1x2 = width;
		let p1y2 = p1y1;
		let p2x2 = width;
		let p2y2 = p2y1;
		let p3x2 = width-tlen/2+lglen;
		let p3y2 = p3y1;
		
		tri1.setAttribute('points',`${p1x1},${p1y1} ${p2x1},${p2y1} ${p3x1},${p3y1}`);
		tri2.setAttribute('points',`${p1x2},${p1y2} ${p2x2},${p2y2} ${p3x2},${p3y2}`);
		tri1.setAttribute('shape-rendering','geometricPrecision');
		tri2.setAttribute('shape-rendering','geometricPrecision');
		
		//Animation element of triangle
		let anim = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
		anim.setAttribute('attributeName','fill');
		anim.setAttribute('values',`${tri_p['color_seq'].join(';')};`);
		anim.setAttribute('dur',`${tri_p['speed']}s`);
		anim.setAttribute('repeatCount',"indefinite");
		
		tri1.appendChild(anim.cloneNode(true));
		tri2.appendChild(anim.cloneNode(true));
		bg.appendChild(tri1);
		bg.appendChild(tri2);
		
		//For rest of triangles in row
		for(let x = 1; x < conf.cols*2; x++){
			let tri = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
			
			let tri_p = gen_tri(prevarr[x],prevc,conf);
			tri.setAttribute('fill',tri_p['color_seq'][0]);
			curarr.push(tri_p['color_seq'][0]);
			prevc = tri_p['color_seq'][0];


			let p1x = (x-1)*tlen/2+lglen;
			let p1y = (isUpright)?(y+1)*thgt-hglen/2:y*thgt+hglen/2;
			let p2x = (x+1)*tlen/2-lglen;
			let p2y = (isUpright)?(y+1)*thgt-hglen/2:y*thgt+hglen/2;;
			let p3x = x*tlen/2;
			let p3y = (isUpright)?y*thgt+glen/2:(y+1)*thgt-glen/2;
			
			tri.setAttribute('points',`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`);
			tri.setAttribute('shape-rendering','geometricPrecision');
			
			let anim = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
			anim.setAttribute('attributeName','fill');
			anim.setAttribute('values',`${tri_p['color_seq'].join(';')};`);
			anim.setAttribute('dur',`${tri_p['speed']}s`);
			anim.setAttribute('repeatCount',"indefinite");
			
			tri.appendChild(anim);
			bg.appendChild(tri);
			
			isUpright = !isUpright;
		}
		prevc = undefined;
		prevarr = curarr;
		curarr = [];
	}
	return container;
};